import { getViteConfig } from 'astro/config';
import { defineConfig } from 'vitest/config';

type ViteConfigInput = Parameters<typeof getViteConfig>[0];

export default getViteConfig(
  defineConfig({
    test: {
      environment: 'node',
      include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
      passWithNoTests: false,
    },
  }) as unknown as ViteConfigInput,
);
