import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import js from "@eslint/js";

const eslintConfig = defineConfig([
  js.configs.recommended,
  ...nextVitals,
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      "react-hooks/error-boundaries": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "max-len": [
        "warn",
        {
          code: 120,
          ignoreTemplateLiterals: true,
        },
      ],
      "linebreak-style": "off",
      quotes: ["error", "double"],
      "jsx-quotes": ["error", "prefer-double"],
      semi: ["error", "always"],
      "no-console": [
        "warn",
        {
          allow: ["warn", "error", "info"],
        },
      ],
      "no-trailing-spaces": 2,
    },
  },
]);

export default eslintConfig;
