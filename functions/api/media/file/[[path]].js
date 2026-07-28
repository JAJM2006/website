import { isAuthorizedForGallery, guessMime } from '../../../_utils.js';

export async function onRequestGet({ request, env, params }) {
  const segments = Array.isArray(params.path) ? params.path : [params.path];
  if (segments.length < 2) return new Response('Not found', { status: 404 });

  const [galleryId, ...rest] = segments;
  const filename = rest.join('/');
  const key = `${galleryId}/${filename}`;

  const authorized = await isAuthorizedForGallery(request, env, galleryId);
  if (!authorized) return new Response('Not authorized', { status: 401 });

  const rangeHeader = request.headers.get('Range');
  const head = await env.MEDIA_BUCKET.head(key);
  if (!head) return new Response('Not found', { status: 404 });

  const mime = guessMime(filename);
  const commonHeaders = {
    'Content-Type': mime,
    'Cache-Control': 'private, max-age=3600',
    'Accept-Ranges': 'bytes',
    'Content-Disposition': `inline; filename="${filename.replace(/"/g, '')}"`,
  };

  if (rangeHeader) {
    const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
    const size = head.size;
    let start = match && match[1] ? parseInt(match[1], 10) : 0;
    let end = match && match[2] ? parseInt(match[2], 10) : size - 1;
    if (isNaN(start)) start = 0;
    if (isNaN(end) || end >= size) end = size - 1;
    if (start > end || start >= size) {
      return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    }
    const obj = await env.MEDIA_BUCKET.get(key, { range: { offset: start, length: end - start + 1 } });
    if (!obj) return new Response('Not found', { status: 404 });
    return new Response(obj.body, {
      status: 206,
      headers: {
        ...commonHeaders,
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': String(end - start + 1),
      },
    });
  }

  const obj = await env.MEDIA_BUCKET.get(key);
  if (!obj) return new Response('Not found', { status: 404 });
  return new Response(obj.body, {
    headers: { ...commonHeaders, 'Content-Length': String(head.size) },
  });
}
