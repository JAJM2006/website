import { clearCookieHeader, json } from '../../_utils.js';

export async function onRequestPost({ request }) {
  // ✅ PASS `request` TO clearCookieHeader HERE:
  return json({ ok: true }, { headers: { 'Set-Cookie': clearCookieHeader('media_admin', request) } });
}
