import { getAdminAuth, json } from '../../_utils.js';

export async function onRequestDelete({ request, env }) {
  if (!(await getAdminAuth(request, env))) return json({ error: 'Not authorized' }, { status: 401 });

  const url = new URL(request.url);
  const gallery = url.searchParams.get('gallery') || '';
  const key = url.searchParams.get('key') || '';
  if (!gallery || !key) return json({ error: 'Missing gallery or key' }, { status: 400 });

  await env.MEDIA_BUCKET.delete(`${gallery}/${key}`);
  return json({ ok: true });
}
