import { timingSafeEqual, signCookieValue, cookieHeader, json, checkConfig, SESSION_MAX_AGE } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  try {
    const configError = checkConfig(env, ['admin', 'session']);
    if (configError) return json({ error: configError }, { status: 500 });
    
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Bad request — expected JSON body' }, { status: 400 });
    }
    
    const password = (body.password || '').toString();
    if (!password || !timingSafeEqual(password, env.ADMIN_PASSWORD)) {
      return json({ error: 'Incorrect password' }, { status: 401 });
    }
    
    const cookieValue = await signCookieValue({ admin: true, exp: Date.now() + SESSION_MAX_AGE * 1000 }, env.SESSION_SECRET);
    return json({ ok: true }, { headers: { 'Set-Cookie': cookieHeader('media_admin', cookieValue, SESSION_MAX_AGE) } });
  } catch (err) {
    return json({ error: `Unexpected server error: ${err.message}` }, { status: 500 });
  }
}