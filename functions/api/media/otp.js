import { consumeOtp, signCookieValue, cookieHeader, json } from '../../_utils.js';

// How long the *resulting* session lasts once a code has been redeemed.
// This is separate from OTP_TTL_SECONDS (900s), which only bounds how long
// the code itself is valid for redemption. An hour gives someone enough
// time to actually browse/download after typing the code in.
// Tune freely — it's independent of the 15-min redemption window.
const OTP_SESSION_MAX_AGE = 60 * 60; // 1 hour

// POST /api/media/otp
// body: { code: string }
// On success, sets a media_otp cookie scoped to whatever the code named
// (a whole gallery, or a single file within one) and consumes the code.
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
    { headers: { 'Set-Cookie': cookieHeader('media_otp', cookieValue, OTP_SESSION_MAX_AGE) } }
  );
}
