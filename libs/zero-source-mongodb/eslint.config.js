import { config } from "@repo/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default {
    ...config,
    rules: {
        ...config,
        'turbo/no-undeclared-env-vars': 'off'
    }
};