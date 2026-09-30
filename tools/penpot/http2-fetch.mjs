import { connect } from 'node:http2';
import { Readable } from 'node:stream';

// Use HTTP/2 for Penpot's SSE responses; some HTTP/1.1 intermediaries break chunk framing.
export function http2Fetch(input, init = {}) {
  const url = new URL(input);
  return new Promise((resolve, reject) => {
    const session = connect(url.origin);
    session.on('error', reject);
    const headers = Object.fromEntries(new Headers(init.headers));
    const request = session.request({ ...headers, ':method': init.method || 'GET', ':path': url.pathname + url.search });
    const abort = () => { request.destroy(new Error('Solicitud cancelada')); session.close(); };
    init.signal?.addEventListener('abort', abort, { once: true });
    request.on('error', reject);
    request.on('close', () => { init.signal?.removeEventListener('abort', abort); session.close(); });
    request.on('response', incoming => {
      const status = Number(incoming[':status']);
      const responseHeaders = Object.fromEntries(Object.entries(incoming).filter(([key]) => !key.startsWith(':')));
      if ([204, 205, 304].includes(status)) request.resume();
      resolve(new Response([204, 205, 304].includes(status) ? null : Readable.toWeb(request), { status, headers: responseHeaders }));
    });
    request.end(init.body);
  });
}
