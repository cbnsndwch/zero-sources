import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import { nanoid } from 'nanoid';

import { multiLine } from '../../../utils/string-utils.js';

import type {
    FeedbackResponse,
    User,
    UserIdentification
} from '../contracts.js';
import type { SubmitFeedbackInput } from '../models/index.js';

const DEFAULT_REPO_OWNER = 'cbnsndwch';
const DEFAULT_REPO_NAME = 'zero-sources';
const DEFAULT_BASE_ID = 'pw6chj1mtry7j26';
const DEFAULT_USER_TABLE_ID = 'mze4pt0i61k3ir7';
const DEFAULT_FEEDBACK_TABLE_ID = 'mchcq5gnzqxdf86';

const RANDOM_ADJECTIVES = [
    'Anonymous',
    'Helpful',
    'Thoughtful',
    'Curious',
    'Friendly',
    'Kind',
    'Active',
    'Engaged'
];

const RANDOM_NOUNS = [
    'Contributor',
    'Reader',
    'User',
    'Developer',
    'Reviewer',
    'Supporter',
    'Member',
    'Visitor'
];

/**
 * Service for handling feedback submissions
 * - Creates or retrieves users with anonymized display names
 * - Stores feedback in NocoDB
 * - Creates GitHub issues with anonymized attribution
 */
@Injectable()
export class FeedbackService {
    private readonly logger = new Logger(FeedbackService.name);
    private readonly octokit: Octokit;
    private readonly repoOwner: string;
    private readonly repoName: string;
    private readonly dbUrl: string;
    private readonly dbToken: string;
    private readonly dbBaseId: string;
    private readonly dbUserTableId: string;
    private readonly dbFeedbackTableId: string;

    constructor(private readonly configService: ConfigService) {
        const githubToken = this.configService.get<string>('GITHUB_TOKEN');
        if (!githubToken) {
            throw new Error('GITHUB_TOKEN not configured');
        }

        this.octokit = new Octokit({ auth: githubToken });
        this.repoOwner = this.configService.get<string>(
            'GITHUB_REPO_OWNER',
            DEFAULT_REPO_OWNER
        );
        this.repoName = this.configService.get<string>(
            'GITHUB_REPO_NAME',
            DEFAULT_REPO_NAME
        );
        this.dbUrl = this.configService.get<string>('DB_URL')!;
        this.dbToken = this.configService.get<string>('DB_TOKEN')!;
        this.dbBaseId = this.configService.get<string>(
            'BASE_ID',
            DEFAULT_BASE_ID
        );
        this.dbUserTableId = this.configService.get<string>(
            'USER_TABLE_ID',
            DEFAULT_USER_TABLE_ID
        );
        this.dbFeedbackTableId = this.configService.get<string>(
            'FEEDBACK_TABLE_ID',
            DEFAULT_FEEDBACK_TABLE_ID
        );
    }

    /**
     * Submit feedback - main entry point
     */
    async submitFeedback(dto: SubmitFeedbackInput): Promise<FeedbackResponse> {
        const { url, opinion, email, name, message } = dto;

        try {
            // Get or create user and get their anonymized display name
            const { userId, displayName } = await this.getOrCreateUser(
                email,
                name
            );

            // Create the GitHub issue with anonymized display name
            const { title, body, labels } = this.generateIssueContents(
                url,
                opinion,
                displayName,
                message
            );

            const { data: issue } = await this.octokit.rest.issues.create({
                owner: this.repoOwner,
                repo: this.repoName,
                title,
                body,
                labels
            });

            // Store feedback in NocoDB with real contact info
            await this.storeFeedback(
                userId,
                displayName,
                url,
                opinion,
                message,
                issue.html_url,
                issue.number
            );

            this.logger.log(
                `Feedback submitted successfully: Issue #${issue.number}`
            );

            return {
                githubUrl: issue.html_url,
                issueNumber: issue.number
            };
        } catch (error) {
            this.logger.error('Error submitting feedback:', error);
            throw error;
        }
    }

    //#region Private Helpers

    /**
     * Generate a unique anonymized display name
     */
    private generateDisplayName(): string {
        const adjective =
            RANDOM_ADJECTIVES[
                Math.floor(Math.random() * RANDOM_ADJECTIVES.length)
            ];
        const noun =
            RANDOM_NOUNS[Math.floor(Math.random() * RANDOM_NOUNS.length)];
        const suffix = nanoid(5);

        return `${adjective} ${noun} ${suffix}`;
    }

    /**
     * Get NocoDB headers
     */
    private getHeaders() {
        return {
            'xc-token': this.dbToken,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Get NocoDB users table URL
     */
    private getUsersTableUrl(): string {
        return `${this.dbUrl}/api/v3/data/${this.dbBaseId}/${this.dbUserTableId}`;
    }

    /**
     * Get NocoDB feedback table URL
     */
    private getFeedbackTableUrl(): string {
        return `${this.dbUrl}/api/v3/data/${this.dbBaseId}/${this.dbFeedbackTableId}`;
    }

    /**
     * Get or create user in NocoDB, returns display name
     */
    private async getOrCreateUser(
        email: string,
        name: string
    ): Promise<UserIdentification> {
        const url = this.getUsersTableUrl();
        const headers = this.getHeaders();

        // Check if user exists
        const listResponse = await fetch(
            `${url}/records?where=(email,eq,${encodeURIComponent(email)})`,
            { headers }
        );

        if (!listResponse.ok) {
            throw new Error(`NocoDB lookup failed: ${listResponse.statusText}`);
        }

        const existingUsers = await listResponse.json();

        if (existingUsers.records?.length > 0) {
            const user = existingUsers.records[0] as User;
            return {
                userId: user.id,
                displayName: user.fields.display_name
            };
        }

        // Create new user with anonymized display name
        const createResponse = await fetch(`${url}/records`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                fields: {
                    email,
                    name,
                    display_name: this.generateDisplayName()
                }
            })
        });

        if (!createResponse.ok) {
            throw new Error(
                `NocoDB user creation failed: ${createResponse.statusText}`
            );
        }

        const { records } = (await createResponse.json()) as {
            records: User[];
        };
        const newUser = records[0];

        return {
            userId: newUser.id,
            displayName: newUser.fields.display_name
        };
    }

    /**
     * Store feedback in NocoDB
     */
    private async storeFeedback(
        userId: number,
        displayName: string,
        url: string,
        opinion: string,
        message: string,
        githubUrl: string,
        githubIssueNumber: number
    ): Promise<void> {
        const tableUrl = this.getFeedbackTableUrl();
        const headers = this.getHeaders();

        const response = await fetch(`${tableUrl}/records`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                fields: {
                    url,
                    opinion,
                    message,
                    display_name: displayName,
                    github_issue_url: githubUrl,
                    github_issue_number: githubIssueNumber,
                    User: {
                        Id: userId
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(
                `NocoDB feedback storage failed: ${response.statusText}`
            );
        }
    }

    /**
     * Generates the contents for a GitHub issue based on user feedback
     */
    private generateIssueContents(
        url: string,
        opinion: string,
        displayName: string,
        message: string
    ) {
        const title = `[Feedback] ${opinion === 'good' ? '👍' : '👎'} - ${url}`;
        const body = multiLine(
            `## User Feedback`,
            ``,
            `**Page**: ${url}`,
            `**Opinion**: ${opinion === 'good' ? '👍 Positive' : '👎 Needs Improvement'}`,
            `**Submitted by**: ${displayName}`,
            ``,
            `### Feedback`,
            `${message}`,
            ``,
            `---`,
            `**Submitted via documentation feedback form on ${new Date().toISOString()}**`,
            `**Contact information kept private - this feedback is attributed to an anonymized user**`
        );

        const labels = [
            'documentation',
            'user-feedback',
            `feedback-${opinion}`
        ];

        return { title, body, labels };
    }

    //#endregion Private Helpers
}
