import OAuth2Strategy from 'passport-oauth2';

import {
    applyOptionsDefaults,
    GithubProfile,
    parseProfile,
    StrategyOptions
} from './utils.js';

const USER_PROFILE_URL = 'https://api.github.com/user';
const USER_EMAIL_URL = 'https://api.github.com/user/emails';
const EMAIL_SCOPES = ['user', 'user:email'];
const CUSTOM_HEADERS = { 'user-agent': 'passport-github' };

/**
 * `Strategy` constructor.
 *
 * The GitHub authentication strategy authenticates requests by delegating to
 * GitHub using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occurred, `err` should be set.
 *
 * Options:
 *   - `clientID`     your GitHub application's Client ID
 *   - `clientSecret` your GitHub application's Client Secret
 *   - `callbackURL`  URL to which GitHub will redirect the user after granting authorization
 *   - `scope`        array of permission scopes to request. Valid scopes include:
 *                    'user', 'public_repo', 'repo', 'gist', or none.
 *                    (see http://developer.github.com/v3/oauth/#scopes for more info)
 *   — `userAgent`    All API requests MUST include a valid User Agent string.
 *                    e.g: domain name of your application.
 *                    (see http://developer.github.com/v3/#user-agent-required for more info)
 *   — `allRawEmails` boolean to indicate whether to return all raw email addresses or just the primary
 *
 * Examples:
 *
 *     passport.use(new GitHubStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'super-duper-secret',
 *         callbackURL: 'https://www.example.net/auth/github/callback',
 *         userAgent: 'myapp.com'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
export class Strategy extends OAuth2Strategy {
    #options: OAuth2Strategy.StrategyOptions & StrategyOptions;

    constructor(
        options: StrategyOptions & Partial<OAuth2Strategy.StrategyOptions>,
        verify: OAuth2Strategy.VerifyFunction
    ) {
        const _options = applyOptionsDefaults(options);
        super(_options, verify);

        this._oauth2.useAuthorizationHeaderforGET(true);

        this.name = 'github';
        this.#options = _options;
    }

    /**
     * Retrieve and normalize user profile from GitHub.
     *
     * @param accessToken The GitHub access token for the user
     * @param done PassportJS callback
     * @api protected
     */
    userProfile(
        accessToken: string,

        done: (err?: unknown, profile?: unknown) => void
    ) {
        const fetchProfile = async (): Promise<GithubProfile> => {
            // fetch user profile
            const profileResponse = await fetch(USER_PROFILE_URL, {
                method: 'GET',
                headers: {
                    ...CUSTOM_HEADERS,
                    authorization: `Bearer ${accessToken}`
                }
            });

            // sanity check
            if (!profileResponse.ok) {
                throw new Error('Failed to fetch user profile');
            }

            // parse and extract claims
            const __raw = await profileResponse.json();
            const profile = parseProfile(__raw);

            // check if the strategy settings specified a scope that includes email
            const requestedScopes =
                typeof this.#options.scope === 'string'
                    ? this.#options.scope.split(
                          this.#options.scopeSeparator ?? ','
                      )
                    : (this.#options.scope ?? []);

            // if we did not request any email scope return profile so far
            const hasEmailScope = requestedScopes.some(scope =>
                EMAIL_SCOPES.includes(scope)
            );
            if (!hasEmailScope) {
                return profile;
            }

            // app wants email, so fetch it
            const emailResponse = await fetch(USER_EMAIL_URL, {
                method: 'GET',
                headers: {
                    ...CUSTOM_HEADERS,
                    authorization: `Bearer ${accessToken}`
                }
            });

            // sanity check
            if (!emailResponse.ok) {
                throw new OAuth2Strategy.InternalOAuthError(
                    'Failed to fetch user emails',
                    {
                        status: emailResponse.statusText,
                        statusCode: emailResponse.status
                    }
                );
            }

            // parse and check format
            const emailsBody = await emailResponse.json();
            if (!Array.isArray(emailsBody)) {
                throw new OAuth2Strategy.InternalOAuthError(
                    'Expected an array of emails from GitHub, but got something else',
                    { actual: emailsBody }
                );
            }

            // we got emails! add them to profile
            for (const item of emailsBody) {
                if (item.primary) {
                    profile.mainEmail = item.email;
                    continue;
                }

                profile.additionalEmails.push(item.email);
            }

            return profile;
        };

        void fetchProfile()
            .then(profile => done(null, profile))
            .catch(err => {
                const wrappedError =
                    err instanceof OAuth2Strategy.InternalOAuthError
                        ? err
                        : new OAuth2Strategy.InternalOAuthError(
                              'Failed to fetch user profile',
                              err
                          );

                return done(wrappedError);
            });
    }

    //#region Private Helpers

    //#endregion Private Helpers
}
