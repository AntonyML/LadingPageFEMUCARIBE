import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_MAX_FILE_SIZE,
  getCostaRicaDate,
  validateDocumentDate,
  validateDocumentDescription,
  validateDocumentFile,
  validateDocumentTitle,
} from '../../src/lib/document-validation';

describe('document upload validation', () => {
  it('accepts supported extensions without case sensitivity', () => {
    expect(validateDocumentFile('acta.pdf', 1)).toBeNull();
    expect(validateDocumentFile('presupuesto.XLSX', 1)).toBeNull();
    expect(validateDocumentFile('convenio.doc', 1)).toBeNull();
  });

  it('rejects missing, empty, oversized, and unsupported files', () => {
    expect(validateDocumentFile('', 0)).toContain('seleccionar un archivo');
    expect(validateDocumentFile('acta.pdf', 0)).toContain('está vacío');
    expect(
      validateDocumentFile('acta.pdf', DOCUMENT_MAX_FILE_SIZE + 1),
    ).toContain('50 MB');
    expect(validateDocumentFile('acta.png', 10)).toContain(
      'Formato no permitido',
    );
  });

  it('trims and bounds the official title', () => {
    expect(validateDocumentTitle('  Acta  ')).toBeNull();
    expect(validateDocumentTitle('  ')).toContain('al menos 3');
    expect(validateDocumentTitle('x'.repeat(201))).toContain('200 caracteres');
  });

  it('allows an empty description and caps optional notes', () => {
    expect(validateDocumentDescription('')).toBeNull();
    expect(validateDocumentDescription('x'.repeat(1001))).toContain(
      '1000 caracteres',
    );
  });

  it('checks real calendar dates and prevents future issue dates', () => {
    expect(validateDocumentDate('2024-02-29', '2026-10-23')).toBeNull();
    expect(validateDocumentDate('2025-02-29', '2026-10-23')).toContain(
      'fecha de emisión válida',
    );
    expect(validateDocumentDate('2026-10-24', '2026-10-23')).toContain(
      'posterior a hoy',
    );
    expect(validateDocumentDate('', '2026-10-23')).toContain(
      'fecha de emisión',
    );
  });

  it('uses Costa Rica local date rather than the UTC calendar date', () => {
    expect(getCostaRicaDate(new Date('2026-10-23T03:00:00.000Z'))).toBe(
      '2026-10-22',
    );
  });
});
