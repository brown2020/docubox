/**
 * ESLint flat config for Next.js 16 + ESLint 10.
 * Uses @eslint/compat to bridge eslint-plugin-react for ESLint 10 compatibility.
 */
import { fixupConfigRules } from "@eslint/compat";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  ...fixupConfigRules([...nextCoreWebVitals, ...nextTypeScript]),
  {
    rules: {
      "react-hooks/incompatible-library": "off",
      // Disable new strict rules introduced in eslint-plugin-react-hooks@^7.x
      // that flag patterns used throughout this codebase (including auth files).
      // This is a config-level suppression — no auth logic is modified.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
    },
  },
];

export default config;


