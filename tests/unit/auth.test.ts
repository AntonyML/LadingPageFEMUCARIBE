import { createHmac } from 'node:crypto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
    vi.useRealTimers();
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

    it.each(['ADMIN_PASSWORD', 'SESSION_SECRET'])(
      'rejects valid credentials when %s is absent',
      (variable) => {
        delete process.env[variable];
        expect(
          validateCredentials('soporte@femucaribe.go.cr', 'TestPassword123!'),
        ).toBe(false);
      },
    );
  });

  describe('createSessionToken & verifySessionToken', () => {
    const signPayload = (payload: unknown, secret?: string): string => {
      const encoded = Buffer.from(JSON.stringify(payload)).toString(
        'base64url',
      );
      const signature = createHmac(
        'sha256',
        secret ?? 'test_super_secret_session_key_for_testing',
      )
        .update(encoded)
        .digest('base64url');
      return `${encoded}.${signature}`;
    };

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

    it('rejects additional token segments despite a valid signature', () => {
      const token = createSessionToken('soporte@femucaribe.go.cr');
      expect(verifySessionToken(`${token}.ignored`).valid).toBe(false);
    });

    it('does not create tokens without an explicitly configured secret', () => {
      delete process.env.SESSION_SECRET;
      expect(() => createSessionToken('soporte@femucaribe.go.cr')).toThrow(
        'SESSION_SECRET',
      );
    });

    it.each(['ADMIN_PASSWORD', 'SESSION_SECRET'])(
      'rejects an existing valid session when %s is absent',
      (variable) => {
        const token = createSessionToken('soporte@femucaribe.go.cr');
        delete process.env[variable];
        expect(verifySessionToken(token).valid).toBe(false);
      },
    );

    it('rejects a forged token signed with the former public default key', () => {
      const now = Math.floor(Date.now() / 1000);
      const token = signPayload(
        { email: 'soporte@femucaribe.go.cr', iat: now, exp: now + 3600 },
        'femucaribe_default_session_secret_change_in_production',
      );
      delete process.env.SESSION_SECRET;
      expect(verifySessionToken(token).valid).toBe(false);
      process.env.SESSION_SECRET = 'test_super_secret_session_key_for_testing';
      expect(verifySessionToken(token).valid).toBe(false);
    });

    it.each([
      null,
      [],
      {},
      { email: 42, iat: 1, exp: 9_999_999_999 },
      { email: 'soporte@femucaribe.go.cr', exp: 9_999_999_999 },
      { email: 'soporte@femucaribe.go.cr', iat: '1', exp: 9_999_999_999 },
      { email: 'soporte@femucaribe.go.cr', iat: 1 },
      { email: 'soporte@femucaribe.go.cr', iat: 1, exp: '9999999999' },
      { email: 'soporte@femucaribe.go.cr', iat: 1, exp: null },
      { email: 'otro@femucaribe.go.cr', iat: 1, exp: 9_999_999_999 },
    ])('rejects a signed malformed or foreign-user payload: %j', (payload) => {
      expect(verifySessionToken(signPayload(payload)).valid).toBe(false);
    });

    it('rejects a signed payload with a non-finite date', () => {
      const encoded = Buffer.from(
        '{"email":"soporte@femucaribe.go.cr","iat":1,"exp":1e400}',
      ).toString('base64url');
      const signature = createHmac(
        'sha256',
        'test_super_secret_session_key_for_testing',
      )
        .update(encoded)
        .digest('base64url');
      expect(verifySessionToken(`${encoded}.${signature}`).valid).toBe(false);
    });

    it('rejects a future-issued session', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(
        verifySessionToken(
          signPayload({
            email: 'soporte@femucaribe.go.cr',
            iat: now + 3600,
            exp: now + 7200,
          }),
        ).valid,
      ).toBe(false);
    });

    it('expires at the exact exp second', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-10-22T12:00:00.000Z'));
      const token = createSessionToken('soporte@femucaribe.go.cr', 60);
      vi.advanceTimersByTime(59_000);
      expect(verifySessionToken(token).valid).toBe(true);
      vi.advanceTimersByTime(1000);
      expect(verifySessionToken(token)).toEqual({
        valid: false,
        error: 'token_expired',
      });
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
