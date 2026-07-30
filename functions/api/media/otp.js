import { consumeOtp, signCookieValue, cookieHeader, json } from '../../_utils.js';

const OTP_SESSION_MAX_AGE = 60 * 60; // 1 hour

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Bad request' }, { status: 400 });
  }

  const code = (body.code || '').toString().trim().toUpperCase();
  if (!code) return json({ error: 'Missing code' }, { status: 400 });

  const scope = await consumeOtp(env, code);
  if (!scope) return json({ error: 'Invalid or expired code' }, { status: 401 });

  const cookieValue = await signCookieValue(
    {
      gallery: scope.gallery,
      type: scope.type,
      file: scope.file,
      exp: Date.now() + OTP_SESSION_MAX_AGE * 1000,
    },
    env.SESSION_SECRET
  );

  return json(
    { ok: true, gallery: scope.gallery, type: scope.type, file: scope.file },
    // ✅ PASS `request` TO cookieHeader HERE:
    { headers: { 'Set-Cookie': cookieHeader('media_otp', cookieValue, OTP_SESSION_MAX_AGE, request) } }
  );
}
