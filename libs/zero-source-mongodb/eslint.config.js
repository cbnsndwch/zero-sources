import config from '@repo/eslint-config/base';

export default [
    ...config,
    {
        rules: {
            // specific overrides for this package
            'turbo/no-undeclared-env-vars': 'off'
        }
    }
];
