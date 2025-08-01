import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import { defineConfig } from "eslint/config";


export default defineConfig([
  {
    ignores: [
      "dist/**.*"
    ]
  },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  tseslint.configs.recommended,
  {
    rules: {
      "semi": "error",
    }
  },
  { files: ["**/*.json"], ignores: ["**/tsconfig.json", "package-lock.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
  {
    files: [
      "**/tsconfig.json",
      "**/*.code-workspace"
    ], plugins: { json }, language: "json/jsonc", extends: ["json/recommended"]
  },
  { files: ["**/*.md"], plugins: { markdown }, language: "markdown/gfm", extends: ["markdown/recommended"] },
]);
