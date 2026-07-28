import { getAdminAuth, hashPassword, slugify, json } from '../../_utils.js';

export async function onRequestGet({ request, env }) {
  if (!(await getAdminAuth(request, env))) return json({ error: 'Not authorized' }, { status: 401 });

  const list = await env.MEDIA_KV.list({ prefix: 'gallery:' });
  const galleries = await Promise.all(
    list.keys.map(async (k) => {
      const raw = await env.MEDIA_KV.get(k.name);
      const meta = JSON.parse(raw);
      const id = k.name.slice('gallery:'.length);
      const filesListed = await env.MEDIA_BUCKET.list({ prefix: `${id}/` });
      return { id, name: meta.name, createdAt: meta.createdAt, fileCount: filesListed.objects.length };
    })
  );
  return json({ galleries });
}

export async function onRequestPost({ request, env }) {
  if (!(await getAdminAuth(request, env))) return json({ error: 'Not authorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Bad request' }, { status: 400 });
  }

  const name = (body.name || '').toString().trim();
  const password = (body.password || '').toString();
  let id = slugify(body.id || name);

  if (!name || !password) return json({ error: 'Name and password are required' }, { status: 400 });
  if (!id) return json({ error: 'Could not derive a valid gallery id from that name' }, { status: 400 });
  if (password.length < 6) return json({ error: 'Password should be at least 6 characters' }, { status: 400 });

  const existing = await env.MEDIA_KV.get(`gallery:${id}`);
  const createdAt = existing ? JSON.parse(existing).createdAt : new Date().toISOString();

  const { salt, hash } = await hashPassword(password);
  await env.MEDIA_KV.put(`gallery:${id}`, JSON.stringify({ name, salt, hash, createdAt }));

  return json({ ok: true, id });
}

export async function onRequestDelete({ request, env }) {
  if (!(await getAdminAuth(request, env))) return json({ error: 'Not authorized' }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';
  if (!id) return json({ error: 'Missing id' }, { status: 400 });

  const listed = await env.MEDIA_BUCKET.list({ prefix: `${id}/` });
  const keys = listed.objects.map((o) => o.key);
  if (keys.length) await env.MEDIA_BUCKET.delete(keys);
  await env.MEDIA_KV.delete(`gallery:${id}`);

  return json({ ok: true });
}
