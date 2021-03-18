module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "jest",
    "promise",
    "prettier"
  ],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:jest/recommended",
    "plugin:promise/recommended",
    "prettier",
  ],
  parserOptions: {
    project: "tsconfig.json"
  },
  env: {
    node: true,
    jest: true,
  },
  rules: {
    "prettier/prettier": "error",
    "indent": "off",
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/explicit-function-return-type": ["off"],
    "@typescript-eslint/explicit-member-accessibility": ["off"],
  },
}
