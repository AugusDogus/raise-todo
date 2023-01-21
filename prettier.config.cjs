/** @type {import("prettier").Config} */
module.exports = {
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  bracketSpacing: true,
  bracketSameLine: true,
  arrowParens: 'always',
  singleAttributePerLine: false,
  trailingComma: 'all',
  printWidth: 120,
};
