import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Downgrade TypeScript any errors to warnings for development
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      // Downgrade React/JSX warnings for development
      "react/no-unescaped-entities": "warn",
      "jsx-a11y/alt-text": "warn",
      "react-hooks/exhaustive-deps": "warn",
      // Next.js specific warnings
      "@next/next/no-img-element": "warn",
    },
  },
];

export default eslintConfig;
