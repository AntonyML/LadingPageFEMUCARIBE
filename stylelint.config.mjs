export default {
  extends: ['stylelint-config-standard'],
  overrides: [{ files: ['**/*.astro'], customSyntax: 'postcss-html' }],
  ignoreFiles: ['node_modules/**', 'dist/**', '.astro/**'],
};
