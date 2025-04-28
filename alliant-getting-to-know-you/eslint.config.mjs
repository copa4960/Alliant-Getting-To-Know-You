import pluginNext from "next/eslint-plugin-next";

const eslintConfig = [
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    plugins: {
      "@next/next": pluginNext,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    settings: {},
    rules: {
      ...Object.fromEntries(
        Object.keys(pluginNext.configs.recommended.rules || {}).map((rule) => [
          rule,
          "off",
        ])
      ),
    },
  },
];

export default eslintConfig;

