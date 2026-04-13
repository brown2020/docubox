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
    },
  },
];

export default config;


