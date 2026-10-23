// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

/** @type {import('astro').AstroUserConfig} */
const config = { session: false };

if (!process.env.VITEST) {
  config.adapter = node({
    mode: 'standalone',
    bodySizeLimit: 52 * 1024 * 1024,
  });
}

// https://astro.build/config
export default defineConfig(config);
