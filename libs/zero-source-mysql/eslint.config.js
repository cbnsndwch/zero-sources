import { config } from "@repo/eslint-config/base";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
    ...config,
    {
        rules: {
            // specific overrides for this package
            'turbo/no-undeclared-env-vars': 'off'
        }
    }
];
