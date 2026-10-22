import '../.astro/types.d.ts';

declare global {
  namespace App {
    interface Locals {
      user?: { email?: string | undefined } | undefined;
    }
  }
}
