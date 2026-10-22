import type { APIRoute } from 'astro';
import {
  getDocumentById,
  deleteDocument,
} from '../../../../lib/documents-repository';
import { deleteFileFromStorage } from '../../../../lib/storage-client';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) {
    return new Response(
      JSON.stringify({ error: 'Identificador no proporcionado' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const document = await getDocumentById(id);
  if (!document) {
    return new Response(JSON.stringify({ error: 'Documento no encontrado' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true, document }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) {
    return new Response(
      JSON.stringify({ error: 'Identificador no proporcionado' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const document = await getDocumentById(id);
  if (!document) {
    return new Response(JSON.stringify({ error: 'Documento no encontrado' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Purge from physical remote storage API
  if (document.fileId) {
    await deleteFileFromStorage(document.fileId);
  }

  // Remove metadata from local repository
  await deleteDocument(id);

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Documento eliminado correctamente',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};
