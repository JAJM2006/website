import { timingSafeEqual, signCookieValue, cookieHeader, json, SESSION_MAX_AGE } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Bad request' }, { status: 400 });
  }
  const password = (body.password || '').toString();
  if (!env.ADMIN_PASSWORD) return json({ error: 'Admin not configured' }, { status: 500 });
  if (!password || !timingSafeEqual(password, env.ADMIN_PASSWORD)) {
    return json({ error: 'Incorrect password' }, { status: 401 });
  }
  const cookieValue = await signCookieValue({ admin: true, exp: Date.now() + SESSION_MAX_AGE * 1000 }, env.SESSION_SECRET);
  return json({ ok: true }, { headers: { 'Set-Cookie': cookieHeader('media_admin', cookieValue, SESSION_MAX_AGE) } });
}
