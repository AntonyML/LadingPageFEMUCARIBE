export default {
  extends: ['stylelint-config-standard'],
  overrides: [
    { files: ['**/*.astro'], customSyntax: 'postcss-html' },
    {
      // Preserve the upstream starter CSS; new components use the full standard.
      files: ['src/components/Welcome.astro'],
      rules: {
        'color-function-notation': null,
        'color-function-alias-notation': null,
        'alpha-value-notation': null,
        'media-feature-range-notation': null,
        'property-no-vendor-prefix': [
          true,
          { ignoreProperties: ['-webkit-background-clip'] },
        ],
      },
    },
  ],
  ignoreFiles: ['node_modules/**', 'dist/**', '.astro/**'],
};
