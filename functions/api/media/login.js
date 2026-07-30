import { verifyPassword, signCookieValue, cookieHeader, parseCookies, verifyCookieValue, json, SESSION_MAX_AGE } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Bad request' }, { status: 400 });
  }
  const galleryId = (body.gallery || '').toString().trim();
  const password = (body.password || '').toString();
  if (!galleryId || !password) return json({ error: 'Missing gallery or password' }, { status: 400 });

  const raw = await env.MEDIA_KV.get(`gallery:${galleryId}`);
  if (!raw) {
    return json({ error: 'Incorrect password' }, { status: 401 });
  }
  const meta = JSON.parse(raw);
  const ok = await verifyPassword(password, meta.salt, meta.hash);
  if (!ok) return json({ error: 'Incorrect password' }, { status: 401 });

  const cookies = parseCookies(request);
  const existing = await verifyCookieValue(cookies.media_auth, env.SESSION_SECRET);
  const galleries = new Set(existing && Array.isArray(existing.galleries) ? existing.galleries : []);
  galleries.add(galleryId);

  const cookieValue = await signCookieValue(
    { galleries: [...galleries], exp: Date.now() + SESSION_MAX_AGE * 1000 },
    env.SESSION_SECRET
  );

  return json(
    { ok: true, name: meta.name },
    // ✅ PASS `request` TO cookieHeader HERE:
    { headers: { 'Set-Cookie': cookieHeader('media_auth', cookieValue, SESSION_MAX_AGE, request) } }
  );
}
