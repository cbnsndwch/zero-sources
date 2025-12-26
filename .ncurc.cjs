const reject = [
    // node types are tied to the version we're using
    '@types/node',

    // turbo does its own thing
    'turbo',

    // some fumadocs packages have breaking changes
    'fumadocs-mdx',
    'fumadocs-typescript',

    // zero v0.25 has breaking changes that need to be handled manually
    '@rocicorp/zero',
];

/**
 * @type {import('npm-check-updates').RunOptions}
 */
module.exports = {
    packageManager: 'pnpm',
    deep: true,
    reject
};
