import { getAdminAuth, createOtp, json, OTP_TTL_SECONDS } from '../../_utils.js';

// POST /api/admin/otp
// body: { gallery: string, type: "folder" | "file", file?: string }
// Requires admin auth (media_admin cookie). Returns a fresh single-use code.
export async function onRequestPost({ request, env }) {
  const isAdmin = await getAdminAuth(request, env);
  if (!isAdmin) return json({ error: 'Not authorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Bad request' }, { status: 400 });
  }

  const galleryId = (body.gallery || '').toString().trim();
  const type = body.type === 'file' ? 'file' : 'folder';
  const file = type === 'file' ? (body.file || '').toString().trim() : null;

  if (!galleryId) return json({ error: 'Missing gallery' }, { status: 400 });
  if (type === 'file' && !file) return json({ error: 'Missing file' }, { status: 400 });

  // Make sure the gallery actually exists before minting a code for it.
  const metaRaw = await env.MEDIA_KV.get(`gallery:${galleryId}`);
  if (!metaRaw) return json({ error: 'Gallery not found' }, { status: 404 });

  const otp = await createOtp(env, { gallery: galleryId, type, file });

  return json({
    code: otp.code,
    gallery: otp.gallery,
    type: otp.type,
    file: otp.file,
    expiresIn: OTP_TTL_SECONDS,
  });
}
