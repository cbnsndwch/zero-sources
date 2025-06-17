 
import type OAuth2Strategy from 'passport-oauth2';

export type StrategyOptions = {
    clientSecret: string;
    clientId: string;
    scope?: string | string[];
};

export type GithubProfile = {
    provider: 'github';

    id: string;
    nodeId: any;
    displayName: any;
    username: any;
    profileUrl: any;

    mainEmail: string;
    additionalEmails: string[];

    photos: string[];

    __raw: any;
};

/**
 * Parse profile.
 */
export function parseProfile(data: any) {
    const profile: GithubProfile = {
        provider: 'github',
        id: String(data.id),
        nodeId: data.node_id,
        displayName: data.name,
        username: data.login,
        profileUrl: data.html_url,
        mainEmail: data.mainEmail,
        additionalEmails: data.additionalEmails ?? [],
        photos: data.avatar_url ? [data.avatar_url] : [],
        __raw: data
    };

    return profile;
}

export function applyOptionsDefaults(
    options: StrategyOptions & Partial<OAuth2Strategy.StrategyOptions>
): OAuth2Strategy.StrategyOptions & StrategyOptions {
    // const _opt: OAuth2Strategy.StrategyOptions & StrategyOptions =
    //     Object.assign(
    //         {
    //             clientID: options.clientId,
    //             authorizationURL: 'https://github.com/login/oauth/authorize',
    //             tokenURL: 'https://github.com/login/oauth/access_token',
    //             scopeSeparator: ',',
    //             customHeaders: {}
    //         },
    //         options ?? {}
    //     );

    return options as OAuth2Strategy.StrategyOptions & StrategyOptions;
}
