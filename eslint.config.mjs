import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Initial data-fetch in useEffect (search/load on mount) is the
      // standard pattern for this MVP; the rule flags it as cascading render.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
