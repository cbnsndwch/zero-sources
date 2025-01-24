const reject = [
    

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

    packageManager: 'yarn',
    deep: true,
    reject
};
