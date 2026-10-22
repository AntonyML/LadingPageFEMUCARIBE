import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const SESSION_COOKIE_NAME = 'femucaribe_session';

export interface AuthConfig {
  adminEmail: string;
  adminPassword: string;
  sessionSecret: string;
}

export interface SessionPayload {
  email: string;
  iat: number;
  exp: number;
}

export interface SessionVerificationResult {
  valid: boolean;
  email?: string;
  error?: string;
}

// Automatically load .env if available in Node runtime
function tryLoadEnv(): void {
  try {
    if (typeof process.loadEnvFile === 'function') {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        process.loadEnvFile(envPath);
      }
    }
  } catch {
    // Ignore if already loaded or not supported in current environment
  }
}

tryLoadEnv();

export function getAuthConfig(): AuthConfig {
  const adminEmail = process.env.ADMIN_EMAIL || 'soporte@femucaribe.go.cr';
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const sessionSecret = process.env.SESSION_SECRET || '';

  return { adminEmail, adminPassword, sessionSecret };
}

function safeStringCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  if (bufA.length !== bufB.length) {
    // Prevent timing leak on length comparison by comparing dummy buffers
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

export function validateCredentials(
  emailInput: unknown,
  passwordInput: unknown,
): boolean {
  if (typeof emailInput !== 'string' || typeof passwordInput !== 'string') {
    return false;
  }

  const trimmedEmail = emailInput.trim().toLowerCase();
  const trimmedPassword = passwordInput.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return false;
  }

  const config = getAuthConfig();

  if (!config.adminPassword || !config.sessionSecret) {
    return false;
  }

  const isEmailMatch = safeStringCompare(
    trimmedEmail,
    config.adminEmail.toLowerCase(),
  );
  const isPasswordMatch = safeStringCompare(
    trimmedPassword,
    config.adminPassword,
  );

  return isEmailMatch && isPasswordMatch;
}

export function createSessionToken(
  email: string,
  expiresInSeconds: number = 86400,
): string {
  const config = getAuthConfig();
  if (!config.sessionSecret) {
    throw new Error('SESSION_SECRET no está configurado.');
  }
  const now = Math.floor(Date.now() / 1000);

  const payload: SessionPayload = {
    email,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const payloadEncoded = Buffer.from(JSON.stringify(payload), 'utf8').toString(
    'base64url',
  );
  const signature = crypto
    .createHmac('sha256', config.sessionSecret)
    .update(payloadEncoded)
    .digest('base64url');

  return `${payloadEncoded}.${signature}`;
}

export function verifySessionToken(token: unknown): SessionVerificationResult {
  if (typeof token !== 'string' || !token.includes('.')) {
    return { valid: false, error: 'invalid_token_format' };
  }

  const segments = token.split('.');
  const [payloadEncoded, signature] = segments;
  if (segments.length !== 2 || !payloadEncoded || !signature) {
    return { valid: false, error: 'malformed_token' };
  }

  const config = getAuthConfig();
  if (!config.adminPassword || !config.sessionSecret) {
    return { valid: false, error: 'auth_not_configured' };
  }
  const expectedSignature = crypto
    .createHmac('sha256', config.sessionSecret)
    .update(payloadEncoded)
    .digest('base64url');

  const bufActual = Buffer.from(signature, 'utf8');
  const bufExpected = Buffer.from(expectedSignature, 'utf8');

  if (bufActual.length !== bufExpected.length) {
    return { valid: false, error: 'signature_mismatch' };
  }

  if (!crypto.timingSafeEqual(bufActual, bufExpected)) {
    return { valid: false, error: 'signature_mismatch' };
  }

  try {
    const rawJson = Buffer.from(payloadEncoded, 'base64url').toString('utf8');
    const payload: unknown = JSON.parse(rawJson);

    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('email' in payload) ||
      typeof payload.email !== 'string' ||
      !('iat' in payload) ||
      typeof payload.iat !== 'number' ||
      !Number.isFinite(payload.iat) ||
      !('exp' in payload) ||
      typeof payload.exp !== 'number' ||
      !Number.isFinite(payload.exp) ||
      payload.email.trim().toLowerCase() !==
        config.adminEmail.trim().toLowerCase()
    ) {
      return { valid: false, error: 'invalid_payload' };
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return { valid: false, error: 'token_expired' };
    }
    if (payload.iat > now || payload.exp <= payload.iat) {
      return { valid: false, error: 'invalid_payload' };
    }

    return { valid: true, email: payload.email };
  } catch {
    return { valid: false, error: 'unparseable_payload' };
  }
}
