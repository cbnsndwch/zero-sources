const reject = [
    // node types are tied to the version we're using
    '@types/node',

    // turbo does its own thing
    'turbo',

    // just in case :)
    '@rocket.chat*'
];

/**
 * @type {import('npm-check-updates').RunOptions}
 */
module.exports = {
    // /**
    //  * @param name     The name of the dependency.
    //  * @param semver   A parsed Semver array of the upgraded version.
    //  */
    // filter(name, semver) {
    //     if (name.startsWith('@nest/')) {
    //         console.log(`Skipping ${name} because it's a Nest dependency.`);
    //         return false;
    //     }
    //     return true;
    // },

    packageManager: 'pnpm',
    deep: true,
    reject
};
