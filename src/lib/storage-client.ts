import fs from 'node:fs';
import path from 'node:path';

export interface StorageConfig {
  endpoint: string;
  apiKey: string;
}

export interface StorageHealthStatus {
  online: boolean;
  status: 'healthy' | 'degraded' | 'offline';
  tunnelUrl?: string | undefined;
  serverTime?: string | undefined;
  totalFiles?: number | undefined;
  error?: string | undefined;
}

export interface StorageUploadedFile {
  fileId: string;
  originalName: string;
  size: number;
  mimeType: string;
  currentDownloadUrl: string;
  relativeDownloadPath: string;
}

export interface StorageUploadResult {
  success: boolean;
  file?: StorageUploadedFile | undefined;
  error?: string | undefined;
}

export interface StorageDeleteResult {
  success: boolean;
  error?: string | undefined;
}

function tryLoadEnv(): void {
  try {
    if (typeof process.loadEnvFile === 'function') {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        process.loadEnvFile(envPath);
      }
    }
  } catch {
    // Ignore if already loaded or not supported in environment
  }
}

tryLoadEnv();

export function getStorageConfig(): StorageConfig {
  const endpoint = (process.env.FEMUCARIBE_STORAGE_ENDPOINT || '')
    .trim()
    .replace(/\/$/, '');
  const apiKey = (process.env.FEMUCARIBE_STORAGE_API_KEY || '').trim();

  return { endpoint, apiKey };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractErrorMessage(value: unknown, depth = 0): string | undefined {
  if (depth > 5 || value == null) return undefined;
  if (typeof value === 'string') {
    const message = value.trim();
    return message ? message.slice(0, 500) : undefined;
  }
  if (Array.isArray(value)) {
    const messages = value
      .map((entry) => extractErrorMessage(entry, depth + 1))
      .filter((message): message is string => Boolean(message));
    return messages.length ? messages.join('; ').slice(0, 500) : undefined;
  }
  if (isRecord(value)) {
    for (const key of ['message', 'error', 'detail', 'description']) {
      const message = extractErrorMessage(value[key], depth + 1);
      if (message) return message;
    }
    try {
      const serialized = JSON.stringify(value);
      return serialized && serialized !== '{}'
        ? serialized.slice(0, 500)
        : undefined;
    } catch {
      return undefined;
    }
  }
  return String(value).slice(0, 500);
}

function isStorageUploadedFile(value: unknown): value is StorageUploadedFile {
  return (
    isRecord(value) &&
    typeof value.fileId === 'string' &&
    typeof value.originalName === 'string' &&
    typeof value.size === 'number' &&
    Number.isFinite(value.size) &&
    typeof value.mimeType === 'string' &&
    typeof value.currentDownloadUrl === 'string' &&
    typeof value.relativeDownloadPath === 'string'
  );
}

export async function checkStorageHealth(
  timeoutMs: number = 4000,
): Promise<StorageHealthStatus> {
  const config = getStorageConfig();

  if (!config.endpoint) {
    return {
      online: false,
      status: 'offline',
      error:
        'Endpoint de almacenamiento no configurado (FEMUCARIBE_STORAGE_ENDPOINT)',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // 1. Basic Health Check
    const healthUrl = `${config.endpoint}/health`;
    const healthRes = await fetch(healthUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!healthRes.ok) {
      clearTimeout(timeoutId);
      return {
        online: false,
        status: 'offline',
        error: `El servidor de almacenamiento respondió con código HTTP ${healthRes.status}`,
      };
    }

    // 2. Authenticated Status Check if apiKey is available
    if (config.apiKey) {
      const statusUrl = `${config.endpoint}/api/v1/status`;
      const statusRes = await fetch(statusUrl, {
        signal: controller.signal,
        headers: {
          'X-API-Key': config.apiKey,
          Accept: 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (statusRes.ok) {
        const data = (await statusRes.json()) as {
          status?: string;
          tunnelUrl?: string;
          serverTime?: string;
          totalFiles?: number;
        };

        return {
          online: true,
          status: 'healthy',
          tunnelUrl: data.tunnelUrl || config.endpoint,
          serverTime: data.serverTime,
          totalFiles: data.totalFiles,
        };
      }

      return {
        online: true,
        status: 'degraded',
        error: 'Conexión activa pero autorización con API Key rechazada',
      };
    }

    clearTimeout(timeoutId);
    return {
      online: true,
      status: 'healthy',
      tunnelUrl: config.endpoint,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : String(err);
    return {
      online: false,
      status: 'offline',
      error: message.includes('abort')
        ? 'Tiempo de espera agotado al conectar con el túnel'
        : message,
    };
  }
}

export async function uploadFileToStorage(
  fileData: Blob | Buffer | Uint8Array,
  filename: string,
  mimeType: string,
  timeoutMs: number = 30000,
): Promise<StorageUploadResult> {
  const config = getStorageConfig();

  if (!config.endpoint || !config.apiKey) {
    return {
      success: false,
      error: 'Almacenamiento no configurado (falta endpoint o API key)',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const formData = new FormData();
    const blob: Blob =
      fileData instanceof Blob
        ? fileData
        : new Blob([fileData as unknown as BlobPart], {
            type: mimeType || 'application/octet-stream',
          });

    formData.append('file', blob, filename);

    const uploadUrl = `${config.endpoint}/api/v1/files/upload`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'X-API-Key': config.apiKey,
      },
      body: formData,
    });

    const responseBody = await response.text();
    clearTimeout(timeoutId);

    let payload: unknown;
    try {
      payload = responseBody ? JSON.parse(responseBody) : undefined;
    } catch {
      payload = undefined;
    }

    const data = isRecord(payload) ? payload : undefined;
    if (
      !response.ok ||
      data?.success !== true ||
      !isStorageUploadedFile(data.file)
    ) {
      const error = extractErrorMessage(data?.error ?? data?.message);
      return {
        success: false,
        error:
          error ||
          (response.ok
            ? 'El servidor de almacenamiento no devolvió los datos del archivo'
            : `Error del servidor de almacenamiento (HTTP ${response.status})`),
      };
    }

    return {
      success: true,
      file: data.file,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: message.toLowerCase().includes('abort')
        ? 'Tiempo de espera agotado al subir el archivo'
        : `Fallo al transmitir archivo: ${message}`,
    };
  }
}

export async function deleteFileFromStorage(
  fileId: string,
  timeoutMs: number = 5000,
): Promise<StorageDeleteResult> {
  const config = getStorageConfig();

  if (!config.endpoint || !config.apiKey) {
    return {
      success: false,
      error: 'Almacenamiento no configurado',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const deleteUrl = `${config.endpoint}/api/v1/files/${encodeURIComponent(fileId)}`;
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      signal: controller.signal,
      headers: {
        'X-API-Key': config.apiKey,
      },
    });

    clearTimeout(timeoutId);

    if (response.status === 404) {
      // If already deleted in storage, consider it deleted
      return { success: true };
    }

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      return {
        success: false,
        error:
          data.error || `Error al eliminar archivo (HTTP ${response.status})`,
      };
    }

    return { success: true };
  } catch (err) {
    clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Error de red al eliminar archivo: ${message}`,
    };
  }
}
