import type { APIRoute } from 'astro';
import {
  saveDocument,
  DOCUMENT_CATEGORIES,
  CANTON_TAGS,
  type DocumentCategory,
  type CantonTag,
} from '../../../../lib/documents-repository';
import { uploadFileToStorage } from '../../../../lib/storage-client';
import {
  DOCUMENT_MAX_FILE_SIZE,
  validateDocumentDate,
  validateDocumentDescription,
  validateDocumentFile,
  validateDocumentTitle,
} from '../../../../lib/document-validation';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return new Response(
      JSON.stringify({
        error: 'Debe enviar los datos en formato multipart/form-data',
      }),
      {
        status: 415,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Cuerpo de solicitud inválido o dañado' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const fileEntry = formData.get('file');
  if (!fileEntry || !(fileEntry instanceof File)) {
    return new Response(
      JSON.stringify({ error: 'Debe adjuntar un archivo válido' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const file = fileEntry;
  if (file.size > DOCUMENT_MAX_FILE_SIZE) {
    return new Response(
      JSON.stringify({
        error: 'El archivo excede el tamaño máximo permitido de 50 MB',
      }),
      {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const fileError = validateDocumentFile(file.name, file.size);
  if (fileError) {
    return new Response(JSON.stringify({ error: fileError }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const title = String(formData.get('title') || '').trim();
  const titleError = validateDocumentTitle(title);
  if (titleError) {
    return new Response(JSON.stringify({ error: titleError }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const category = String(
    formData.get('category') || '',
  ).trim() as DocumentCategory;
  const isCategoryValid = DOCUMENT_CATEGORIES.some((c) => c.id === category);
  if (!isCategoryValid) {
    return new Response(
      JSON.stringify({ error: 'Categoría institucional no válida' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const canton = String(formData.get('canton') || '').trim() as CantonTag;
  const isCantonValid = CANTON_TAGS.includes(canton);
  if (!isCantonValid) {
    return new Response(
      JSON.stringify({ error: 'Cantón institucional no válido' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const documentDate = String(formData.get('documentDate') || '').trim();
  const documentDateError = validateDocumentDate(documentDate);
  if (documentDateError) {
    return new Response(JSON.stringify({ error: documentDateError }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const description = String(formData.get('description') || '').trim();
  const descriptionError = validateDocumentDescription(description);
  if (descriptionError) {
    return new Response(JSON.stringify({ error: descriptionError }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 1. Upload physical file to remote storage API (api-buket)
  const storageResult = await uploadFileToStorage(file, file.name, file.type);

  if (!storageResult.success || !storageResult.file) {
    return new Response(
      JSON.stringify({
        error:
          storageResult.error ||
          'No se pudo guardar el archivo en el servidor de almacenamiento remoto',
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  // 2. Persist metadata in the local documents repository
  const savedDoc = await saveDocument({
    fileId: storageResult.file.fileId,
    title,
    category,
    canton,
    documentDate,
    fileSize: storageResult.file.size || file.size,
    mimeType: storageResult.file.mimeType || file.type,
    originalName: storageResult.file.originalName || file.name,
    downloadUrl: storageResult.file.currentDownloadUrl,
    relativeDownloadPath: storageResult.file.relativeDownloadPath,
    ...(description ? { description } : {}),
  });

  return new Response(JSON.stringify({ success: true, document: savedDoc }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
