import { Octokit } from '@octokit/rest';
import { nanoid } from 'nanoid';

import { internalServerError } from './responses';
import { multiLine } from './utils';

//#region Constants

// Get configuration from server-side environment variables
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'cbnsndwch';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'zero-sources';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const DB_BASE_ID = process.env.BASE_ID || 'pw6chj1mtry7j26';
const DB_USER_TABLE_ID = process.env.BASE_ID || 'mze4pt0i61k3ir7';
const DB_FEEDBACK_TABLE_ID = process.env.BASE_ID || 'mchcq5gnzqxdf86';
const DB_URL = process.env.DB_URL!;
const DB_TOKEN = process.env.DB_TOKEN!;

const URL_BASE = `${DB_URL}/api/v3/data/${DB_BASE_ID}`;
const URL_USERS_TABLE = `${URL_BASE}/${DB_USER_TABLE_ID}`;
const URL_FEEDBACK_TABLE = `${URL_BASE}/${DB_FEEDBACK_TABLE_ID}`;

const headers = {
    'xc-token': DB_TOKEN,
    'Content-Type': 'application/json'
};

const ADJECTIVES = [
    'Anonymous',
    'Helpful',
    'Thoughtful',
    'Curious',
    'Friendly',
    'Kind',
    'Active',
    'Engaged'
];
const NOUNS = [
    'Contributor',
    'Reader',
    'User',
    'Developer',
    'Reviewer',
    'Supporter',
    'Member',
    'Visitor'
];

// Initialize Octokit
export const octokit = new Octokit({ auth: GITHUB_TOKEN });

//#endregion Constants

//#region Contracts

type DbRecord<T> = {
    id: number;
    fields: T & {
        CreatedAt: string; // ISO 8601 Date String
        UpdatedAt: string; // ISO 8601 Date String
    };
};

type User = DbRecord<{
    name: string;
    email: string;
    display_name: string;
}>;

type FeedbackItem = DbRecord<{
    url: string;
    opinion: string;
    message: string;
    user_id: number;
    display_name: string;
    github_issue_url: string;
    github_issue_number: number;
}>;

export interface FeedbackPayload {
    name: string;
    email: string;
    url: string;
    opinion: 'good' | 'bad';
    message: string;
}

export interface FeedbackResponse {
    githubUrl: string;
    issueNumber: number;
}

//#endregion Contracts

/**
 * Generate a unique anonymized display name
 */
export function generateDisplayName(): string {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const suffix = nanoid(5);

    return `${adjective} ${noun} ${suffix}`;
}

/**
 * Get or create user in NocoDB, returns display name
 */
export async function getOrCreateUser(
    email: string,
    name: string
): Promise<{ userId: number; displayName: string }> {
    // Check if user exists
    const listResponse = await fetch(
        `${URL_USERS_TABLE}/records?where=(email,eq,${encodeURIComponent(email)})`,
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
    const createResponse = await fetch(`${URL_USERS_TABLE}/records`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            fields: {
                email,
                name,
                display_name: generateDisplayName()
            }
        })
    });

    if (!createResponse.ok) {
        throw new Error(
            `NocoDB user creation failed: ${createResponse.statusText}`
        );
    }

    const { records } = (await createResponse.json()) as { records: User[] };
    const newUser = records[0];
    return {
        userId: newUser.id,
        displayName: newUser.fields.display_name
    };
}

/**
 * Store feedback in NocoDB
 */
export async function storeFeedback(
    userId: number,
    displayName: string,
    url: string,
    opinion: string,
    message: string,
    githubUrl: string,
    githubIssueNumber: number
): Promise<void> {
    const response = await fetch(`${URL_FEEDBACK_TABLE}/records`, {
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
 * Generates the contents for a GitHub issue based on user feedback.
 *
 * @param url - The URL of the page the feedback is about
 * @param opinion - The user's opinion, either 'good' or 'bad'
 * @param displayName - The display name of the user providing feedback
 * @param message - The feedback message content
 * @returns An object containing the issue title, body, and labels for GitHub issue creation
 *
 * @example
 * ```typescript
 * const issueData = generateIssueContents(
 *   'https://example.com/docs',
 *   'good',
 *   'John Doe',
 *   'Great documentation!'
 * );
 * // Returns: { title: '[Feedback] 👍 - https://example.com/docs', body: '...', labels: [...] }
 * ```
 */
function generateIssueContents(
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

    const labels = ['documentation', 'user-feedback', `feedback-${opinion}`];
    return { title, body, labels };
}

type RecordFeedbackInput = {
    url: string;
    opinion: string;
    email: string;
    name: string;
    message: string;
};

export async function recordFeedback({
    url,
    opinion,
    email,
    name,
    message
}: RecordFeedbackInput): Promise<Response> {
    if (!GITHUB_TOKEN) {
        console.error('GitHub token not configured');
        return internalServerError('GitHub integration not configured');
    }

    // Get or create user and get their anonymized display name
    const { userId, displayName } = await getOrCreateUser(email, name);

    // Create the GitHub issue with anonymized display name
    const { title, body, labels } = generateIssueContents(
        url,
        opinion,
        displayName,
        message
    );

    const { data: issue } = await octokit.rest.issues.create({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        title,
        body,
        labels
    });

    // Store feedback in NocoDB with real contact info
    await storeFeedback(
        userId,
        displayName,
        url,
        opinion,
        message,
        issue.html_url,
        issue.number
    );

    const result: FeedbackResponse = {
        githubUrl: issue.html_url,
        issueNumber: issue.number
    };

    return new Response(JSON.stringify(result), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
    });
}
