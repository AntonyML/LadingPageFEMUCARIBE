import { getViteConfig } from 'astro/config';
import { defineConfig } from 'vitest/config';

export default getViteConfig(
  defineConfig({
    test: {
      environment: 'node',
      include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
      passWithNoTests: false,
    },
  }),
);
