/**
 * User record in NocoDB
 */
export type DbRecord<T> = {
    id: number;
    fields: T & {
        CreatedAt: string; // ISO 8601 Date String
        UpdatedAt: string; // ISO 8601 Date String
    };
};

/**
 * User entity structure
 */
export type User = DbRecord<{
    name: string;
    email: string;
    display_name: string;
}>;

/**
 * Response structure for feedback submission
 */
export interface FeedbackResponse {
    githubUrl: string;
    issueNumber: number;
}

/**
 * User identification result
 */
export interface UserIdentification {
    userId: number;
    displayName: string;
}
