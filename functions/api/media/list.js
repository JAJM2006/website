import { isAuthorizedForGallery, json } from '../../_utils.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const galleryId = url.searchParams.get('gallery') || '';
  if (!galleryId) return json({ error: 'Missing gallery' }, { status: 400 });

  const authorized = await isAuthorizedForGallery(request, env, galleryId);
  if (!authorized) return json({ error: 'Not authorized' }, { status: 401 });

  const metaRaw = await env.MEDIA_KV.get(`gallery:${galleryId}`);
  if (!metaRaw) return json({ error: 'Not found' }, { status: 404 });
  const meta = JSON.parse(metaRaw);

  const listed = await env.MEDIA_BUCKET.list({ prefix: `${galleryId}/` });
  const files = listed.objects
    .filter((o) => o.size > 0)
    .map((o) => ({
      key: o.key.slice(`${galleryId}/`.length),
      size: o.size,
      uploaded: o.uploaded,
    }))
    .sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));

  return json({ name: meta.name, files });
}
