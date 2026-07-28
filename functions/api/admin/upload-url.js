import { AwsClient } from 'aws4fetch';
import { getAdminAuth, json } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  if (!(await getAdminAuth(request, env))) return json({ error: 'Not authorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Bad request' }, { status: 400 });
  }

  const gallery = (body.gallery || '').toString();
  const filename = (body.filename || '').toString();
  const contentType = (body.contentType || 'application/octet-stream').toString();
  if (!gallery || !filename) return json({ error: 'Missing gallery or filename' }, { status: 400 });

  const exists = await env.MEDIA_KV.get(`gallery:${gallery}`);
  if (!exists) return json({ error: 'Gallery does not exist' }, { status: 404 });

  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]+/g, '_');
  const key = `${gallery}/${Date.now()}-${safeFilename}`;

  const client = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    service: 's3',
    region: 'auto',
  });

  const endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${key}`;
  const signedRequest = await client.sign(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    aws: { signQuery: true },
  });

  return json({ uploadUrl: signedRequest.url, key: key.slice(`${gallery}/`.length) });
}
