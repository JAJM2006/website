// Shared utilities for authentication, hashing, cookies, and sanity checks

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function checkConfig(env, checks = []) {
  if (checks.includes('admin') && !env.ADMIN_PASSWORD) return 'Missing ADMIN_PASSWORD environment variable';
  if (checks.includes('session') && !env.SESSION_SECRET) return 'Missing SESSION_SECRET environment variable';
  if (checks.includes('kv') && !env.MEDIA_KV) return 'Missing MEDIA_KV KV binding';
  if (checks.includes('bucket') && !env.MEDIA_BUCKET) return 'Missing MEDIA_BUCKET R2 binding';
  if (checks.includes('r2creds')) {
    if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET_NAME) {
      return 'Missing one or more R2 API credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME)';
    }
  }
  return null;
}

export function cookieHeader(name, value, maxAge) {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearCookieHeader(name) {
  return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function parseCookies(request) {
  const header = request.headers.get('Cookie') || '';
  const cookies = {};
  header.split(';').forEach((c) => {
    const [k, v] = c.trim().split('=');
    if (k && v) cookies[k] = decodeURIComponent(v);
  });
  return cookies;
}

export function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

async function getCryptoKey(secret) {
  const enc = new TextEncoder();
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signCookieValue(payload, secret) {
  const jsonStr = JSON.stringify(payload);
  const base64Data = btoa(jsonStr);
  const key = await getCryptoKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(base64Data));
  const base64Sig = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${base64Data}.${base64Sig}`;
}

export async function verifyCookieValue(cookieVal, secret) {
  if (!cookieVal || !cookieVal.includes('.')) return null;
  const [base64Data, base64Sig] = cookieVal.split('.');
  try {
    const key = await getCryptoKey(secret);
    const sigArray = Uint8Array.from(atob(base64Sig), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sigArray, new TextEncoder().encode(base64Data));
    if (!valid) return null;
    const payload = JSON.parse(atob(base64Data));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminAuth(request, env) {
  const cookies = parseCookies(request);
  const data = await verifyCookieValue(cookies.media_admin, env.SESSION_SECRET);
  return data && data.admin === true;
}

export async function isAuthorizedForGallery(request, env, galleryId) {
  if (await getAdminAuth(request, env)) return true;
  const cookies = parseCookies(request);
  const data = await verifyCookieValue(cookies.media_auth, env.SESSION_SECRET);
  return data && Array.isArray(data.galleries) && data.galleries.includes(galleryId);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('');
  const enc = new TextEncoder();
  const keyBuf = await crypto.subtle.digest('SHA-256', enc.encode(saltHex + password));
  const hashHex = Array.from(new Uint8Array(keyBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return { salt: saltHex, hash: hashHex };
}

export async function verifyPassword(password, saltHex, expectedHashHex) {
  const enc = new TextEncoder();
  const keyBuf = await crypto.subtle.digest('SHA-256', enc.encode(saltHex + password));
  const hashHex = Array.from(new Uint8Array(keyBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return timingSafeEqual(hashHex, expectedHashHex);
}