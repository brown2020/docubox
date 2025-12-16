/**
 * ESLint v9 uses flat config by default.
 * Next.js 16's `eslint-config-next` exports flat-config arrays directly.
 */
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      // React Compiler-specific warnings can be noisy for apps not using it explicitly.
      "react-hooks/incompatible-library": "off",
    },
  },
];

export default config;


