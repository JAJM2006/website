// Shared helpers for /functions/api/media and /functions/api/admin.
// Filename starts with "_" so Cloudflare Pages does NOT treat this as a route.

const encoder = new TextEncoder();

// ---------- base64url ----------
export function b64urlEncode(bytesOrStr) {
  let bytes = bytesOrStr;
  if (typeof bytesOrStr === 'string') bytes = encoder.encode(bytesOrStr);
  let bin = '';
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlDecodeToString(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

// ---------- timing-safe compare ----------
export function timingSafeEqual(a, b) {
  const ab = encoder.encode(a);
  const bb = encoder.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

// ---------- password hashing (PBKDF2-SHA256) ----------
export async function hashPassword(password, saltHex) {
  const salt = saltHex
    ? Uint8Array.from(saltHex.match(/.{2}/g).map((h) => parseInt(h, 16)))
    : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const hashHex = [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, '0')).join('');
  const saltOutHex = [...salt].map((b) => b.toString(16).padStart(2, '0')).join('');
  return { salt: saltOutHex, hash: hashHex };
}

export async function verifyPassword(password, saltHex, hashHex) {
  const { hash } = await hashPassword(password, saltHex);
  return timingSafeEqual(hash, hashHex);
}

// ---------- signed cookies (HMAC-SHA256) ----------
async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signCookieValue(payloadObj, secret) {
  const payload = b64urlEncode(JSON.stringify(payloadObj));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const sigB64 = b64urlEncode(sig);
  return `${payload}.${sigB64}`;
}

export async function verifyCookieValue(cookieValue, secret) {
  if (!cookieValue || !cookieValue.includes('.')) return null;
  const [payload, sig] = cookieValue.split('.');
  const key = await hmacKey(secret);
  const expected = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expectedB64 = b64urlEncode(expected);
  if (!timingSafeEqual(sig, expectedB64)) return null;
  try {
    const obj = JSON.parse(b64urlDecodeToString(payload));
    if (obj.exp && Date.now() > obj.exp) return null;
    return obj;
  } catch {
    return null;
  }
}

export function parseCookies(request) {
  const header = request.headers.get('Cookie') || '';
  const out = {};
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = v;
  });
  return out;
}

export function cookieHeader(name, value, maxAgeSeconds) {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

// ---------- auth checks ----------
const SESSION_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

export async function getMediaAuth(request, env) {
  const cookies = parseCookies(request);
  return verifyCookieValue(cookies.media_auth, env.SESSION_SECRET);
}

export async function getAdminAuth(request, env) {
  const cookies = parseCookies(request);
  const payload = await verifyCookieValue(cookies.media_admin, env.SESSION_SECRET);
  return payload && payload.admin === true;
}

// OTP-redeemed sessions live in their own cookie, separate from the
// password-based media_auth cookie, since they carry a narrower and
// shorter-lived scope (possibly a single file, not a whole gallery).
export async function getOtpAuth(request, env) {
  const cookies = parseCookies(request);
  return verifyCookieValue(cookies.media_otp, env.SESSION_SECRET);
}

/**
 * Gallery-wide authorization: admin, a password-unlocked gallery, or a
 * folder-scoped OTP redemption. A file-scoped OTP does NOT grant this —
 * it should only unlock the one file it names (see isAuthorizedForFile),
 * not the ability to list/browse the whole gallery.
 */
export async function isAuthorizedForGallery(request, env, galleryId) {
  if (await getAdminAuth(request, env)) return true;

  const auth = await getMediaAuth(request, env);
  if (auth && Array.isArray(auth.galleries) && auth.galleries.includes(galleryId)) return true;

  const otp = await getOtpAuth(request, env);
  if (otp && otp.gallery === galleryId && otp.type === 'folder') return true;

  return false;
}

/**
 * File-level authorization: everything isAuthorizedForGallery allows,
 * plus a file-scoped OTP redemption that names this exact file.
 */
export async function isAuthorizedForFile(request, env, galleryId, filename) {
  if (await isAuthorizedForGallery(request, env, galleryId)) return true;

  const otp = await getOtpAuth(request, env);
  if (otp && otp.gallery === galleryId && otp.type === 'file' && otp.file === filename) return true;

  return false;
}

export { SESSION_MAX_AGE };

// ---------- OTP (one-time share codes) ----------
// KV schema:  otp:<CODE>  ->  JSON { gallery, type: "folder"|"file", file, createdAt }
// TTL: 900s (15 min). Codes are single-use — consumeOtp deletes on read.
const OTP_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
const OTP_LENGTH = 8;
const OTP_TTL_SECONDS = 900;

export function generateOtpCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(OTP_LENGTH));
  let code = '';
  for (let i = 0; i < OTP_LENGTH; i++) code += OTP_CHARSET[bytes[i] % OTP_CHARSET.length];
  return code;
}

/**
 * Creates a new OTP scoped to a gallery (whole folder) or a single file
 * within it, and stores it in KV with a 15-minute TTL.
 */
export async function createOtp(env, { gallery, type, file }) {
  let code = null;
  // Vanishingly unlikely to collide, but a quick check costs little and
  // avoids ever silently overwriting a still-live code.
  for (let attempt = 0; attempt < 5 && !code; attempt++) {
    const candidate = generateOtpCode();
    const existing = await env.MEDIA_KV.get(`otp:${candidate}`);
    if (!existing) code = candidate;
  }
  if (!code) code = generateOtpCode();

  const value = {
    gallery,
    type,
    file: type === 'file' ? file : null,
    createdAt: Date.now(),
  };

  await env.MEDIA_KV.put(`otp:${code}`, JSON.stringify(value), { expirationTtl: OTP_TTL_SECONDS });

  return { code, ...value };
}

/**
 * Reads and deletes an OTP from KV in one step (single-use enforcement).
 * Returns the parsed scope, or null if the code doesn't exist / already
 * expired / already used.
 */
export async function consumeOtp(env, code) {
  const key = `otp:${code}`;
  const raw = await env.MEDIA_KV.get(key);
  if (!raw) return null;
  await env.MEDIA_KV.delete(key);
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export { OTP_TTL_SECONDS };

// ---------- misc ----------
export function json(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init && init.headers) },
  });
}

export function slugify(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

const MIME_TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
  webp: 'image/webp', avif: 'image/avif', heic: 'image/heic',
  mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', mkv: 'video/x-matroska',
  m4v: 'video/x-m4v', avi: 'video/x-msvideo',
};

export function guessMime(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}
