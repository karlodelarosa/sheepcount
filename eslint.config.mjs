import storybook from "eslint-plugin-storybook";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Next.js + TS base configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Storybook support
  ...storybook.configs["flat/recommended"],

  // Custom rules and plugins
  {
    plugins: {
      prettier: prettierPlugin,
      "unused-imports": unusedImportsPlugin, // ✅ match the rule name here
    },
    rules: {
      ...prettierConfig.rules,

      // ✅ Automatically remove unused imports
      "unused-imports/no-unused-imports": "error",

      // Warn (not error) for unused vars (but allow _ignored)
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],

      // Soften the `any` rule if you want
      "@typescript-eslint/no-explicit-any": "warn",

      // ✅ Enforce Prettier formatting
      "prettier/prettier": "error",
    },
  },
];

export default eslintConfig;
