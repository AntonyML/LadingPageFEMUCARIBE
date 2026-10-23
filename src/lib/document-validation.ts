export const DOCUMENT_FILE_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.xlsx',
  '.doc',
  '.xls',
] as const;

export const DOCUMENT_FILE_ACCEPT = DOCUMENT_FILE_EXTENSIONS.join(',');
export const DOCUMENT_FILE_TYPES_LABEL = 'PDF, DOCX, XLSX, DOC y XLS';
export const DOCUMENT_MAX_FILE_SIZE = 50 * 1024 * 1024;
export const DOCUMENT_TITLE_MIN_LENGTH = 3;
export const DOCUMENT_TITLE_MAX_LENGTH = 200;
export const DOCUMENT_DESCRIPTION_MAX_LENGTH = 1000;

export function validateDocumentFile(
  filename: string,
  size: number,
): string | null {
  if (!filename.trim()) {
    return 'Debe seleccionar un archivo oficial para cargar';
  }

  const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  if (!DOCUMENT_FILE_EXTENSIONS.some((allowed) => allowed === extension)) {
    return `Formato no permitido. Use ${DOCUMENT_FILE_TYPES_LABEL}`;
  }

  if (!Number.isFinite(size) || size <= 0) {
    return 'El archivo seleccionado está vacío';
  }

  if (size > DOCUMENT_MAX_FILE_SIZE) {
    return 'El archivo excede el tamaño máximo permitido de 50 MB';
  }

  return null;
}

export function validateDocumentTitle(title: string): string | null {
  const normalizedTitle = title.trim();
  if (normalizedTitle.length < DOCUMENT_TITLE_MIN_LENGTH) {
    return 'El título institucional debe contener al menos 3 caracteres';
  }

  if (normalizedTitle.length > DOCUMENT_TITLE_MAX_LENGTH) {
    return 'El título institucional no puede superar los 200 caracteres';
  }

  return null;
}

export function validateDocumentDescription(
  description: string,
): string | null {
  if (description.length > DOCUMENT_DESCRIPTION_MAX_LENGTH) {
    return 'El resumen no puede superar los 1000 caracteres';
  }

  return null;
}

export function getCostaRicaDate(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Costa_Rica',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function validateDocumentDate(
  documentDate: string,
  today: string = getCostaRicaDate(),
): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(documentDate)) {
    return 'Debe ingresar una fecha de emisión válida';
  }

  const dateParts = documentDate.split('-');
  const year = Number(dateParts[0]);
  const month = Number(dateParts[1]);
  const day = Number(dateParts[2]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) {
    return 'Debe ingresar una fecha de emisión válida';
  }

  const parsedDate = new Date(0);
  parsedDate.setUTCHours(0, 0, 0, 0);
  parsedDate.setUTCFullYear(year, month - 1, day);

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return 'Debe ingresar una fecha de emisión válida';
  }

  if (documentDate > today) {
    return 'La fecha de emisión no puede ser posterior a hoy';
  }

  return null;
}
