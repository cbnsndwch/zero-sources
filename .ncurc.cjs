const reject = [
    // node types are tied to the version we're using
    '@types/node',

    // turbo does its own thing
    'turbo'
];

/**
 * @type {import('npm-check-updates').RunOptions}
 */
module.exports = {
    packageManager: 'pnpm',
    deep: true,
    reject
};
