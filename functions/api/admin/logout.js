import { clearCookieHeader, json } from '../../_utils.js';

export async function onRequestPost() {
  return json({ ok: true }, { headers: { 'Set-Cookie': clearCookieHeader('media_admin') } });
}