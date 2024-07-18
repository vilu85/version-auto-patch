import jest from "eslint-plugin-jest";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends("eslint:recommended"), {
    plugins: {
        jest,
    },

    languageOptions: {
        globals: {
            ...globals.node,
            ...jest.environments.globals.globals,
        },

        ecmaVersion: 2021,
        sourceType: "commonjs",
    },

    rules: {
        eqeqeq: "error",
        "no-unused-vars": "error",
        "no-extra-semi": "error",
        semi: ["error", "always"],
        "no-console": "error",
        "no-debugger": "error",
        indent: ["error", "tab"],
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "single"],
        "prefer-arrow-callback": "error",
        "prefer-const": "error",
        "jest/expect-expect": "error",
        "jest/no-conditional-in-test": "error",
        "jest/no-test-return-statement": "error",
        "jest/require-top-level-describe": "error",
        "jest/valid-title": "error",
    },
}];
