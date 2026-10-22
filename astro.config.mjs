// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

/** @type {import('astro').AstroUserConfig} */
const config = {};

if (!process.env.VITEST) {
  config.adapter = cloudflare({
    imageService: 'passthrough',
  });
}

// https://astro.build/config
export default defineConfig(config);
