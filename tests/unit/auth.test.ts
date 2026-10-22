import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  validateCredentials,
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
} from '../../src/lib/auth';

describe('Auth Utilities (src/lib/auth.ts)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.ADMIN_EMAIL = 'soporte@femucaribe.go.cr';
    process.env.ADMIN_PASSWORD = 'TestPassword123!';
    process.env.SESSION_SECRET = 'test_super_secret_session_key_for_testing';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('exposes SESSION_COOKIE_NAME as femucaribe_session', () => {
    expect(SESSION_COOKIE_NAME).toBe('femucaribe_session');
  });

  describe('validateCredentials', () => {
    it('validates exact matching credentials', () => {
      expect(
        validateCredentials('soporte@femucaribe.go.cr', 'TestPassword123!'),
      ).toBe(true);
    });

    it('validates email case-insensitively with whitespace trimmed', () => {
      expect(
        validateCredentials('  SOPORTE@FEMUCARIBE.GO.CR  ', 'TestPassword123!'),
      ).toBe(true);
    });

    it('rejects incorrect email', () => {
      expect(
        validateCredentials('wrong@femucaribe.go.cr', 'TestPassword123!'),
      ).toBe(false);
    });

    it('rejects incorrect password', () => {
      expect(
        validateCredentials('soporte@femucaribe.go.cr', 'WrongPassword'),
      ).toBe(false);
    });

    it('rejects empty or non-string inputs safely', () => {
      expect(validateCredentials('', 'TestPassword123!')).toBe(false);
      expect(validateCredentials('soporte@femucaribe.go.cr', '')).toBe(false);
      expect(validateCredentials(null, undefined)).toBe(false);
      expect(validateCredentials(123, 456)).toBe(false);
    });

    it('rejects when ADMIN_PASSWORD is not configured', () => {
      process.env.ADMIN_PASSWORD = '';
      expect(
        validateCredentials('soporte@femucaribe.go.cr', 'TestPassword123!'),
      ).toBe(false);
    });
  });

  describe('createSessionToken & verifySessionToken', () => {
    it('creates a token and verifies it successfully', () => {
      const email = 'soporte@femucaribe.go.cr';
      const token = createSessionToken(email);

      expect(typeof token).toBe('string');
      expect(token).toContain('.');

      const result = verifySessionToken(token);
      expect(result.valid).toBe(true);
      expect(result.email).toBe(email);
    });

    it('fails verification if token signature is tampered with', () => {
      const token = createSessionToken('soporte@femucaribe.go.cr');
      const [payload, signature] = token.split('.');
      expect(signature).toBeDefined();
      const tamperedToken = `${payload}.${(signature ?? '').slice(0, -2)}xx`;

      const result = verifySessionToken(tamperedToken);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('signature_mismatch');
    });

    it('fails verification if token is malformed', () => {
      expect(verifySessionToken('not-a-token').valid).toBe(false);
      expect(verifySessionToken('').valid).toBe(false);
      expect(verifySessionToken(null).valid).toBe(false);
    });

    it('fails verification if token has expired', () => {
      // Create a token that expires immediately (-10 seconds)
      const token = createSessionToken('soporte@femucaribe.go.cr', -10);
      const result = verifySessionToken(token);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('token_expired');
    });
  });
});
