import { config } from "@repo/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config} */
export default {
    ...config,
    rules: {
        ...config.rules,
        "react/prop-types": "off",
    },
};