// ═══════════════════════════════════════════════════════════
// R2 Art Storage — S3-compatible. Holds credentials server-side.
// If env vars are missing, art() returns null and the server
// reports R2 as disabled (client falls back to local storage).
// ═══════════════════════════════════════════════════════════
const crypto = require('crypto');

let S3 = null, PutObjectCommand = null, GetObjectCommand = null, HeadObjectCommand = null;
try {
  const sdk = require('@aws-sdk/client-s3');
  S3 = sdk.S3Client;
  PutObjectCommand = sdk.PutObjectCommand;
  GetObjectCommand = sdk.GetObjectCommand;
  HeadObjectCommand = sdk.HeadObjectCommand;
} catch (e) {
  console.warn('[r2] @aws-sdk/client-s3 not installed — R2 art disabled.');
}

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_PUBLIC_URL // e.g. https://art.yourdomain.com  OR  https://pub-xxxx.r2.dev
} = process.env;

// Accept either a bare bucket name or a pasted full endpoint URL
// ("https://<acct>.r2.cloudflarestorage.com/mybucket" -> "mybucket")
const R2_BUCKET = (process.env.R2_BUCKET || '')
  .trim()
  .replace(/^https?:\/\/[^/]+\//, '')
  .replace(/\/+$/, '')
  .split('/')
  .pop();

let client = null;
function enabled() {
  return !!(S3 && R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET && R2_PUBLIC_URL);
}

function getClient() {
  if (!enabled()) return null;
  if (client) return client;
  client = new S3({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY
    }
  });
  return client;
}

// Parse a data URL like "data:image/png;base64,AAAA..." → {buffer, contentType}
function parseDataUrl(dataUrl) {
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || '');
  if (!m) return null;
  return { contentType: m[1], buffer: Buffer.from(m[2], 'base64') };
}

// Content-addressed key: identical images dedupe, re-uploads are free.
function keyFor(buffer, contentType) {
  const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 24);
  const ext = (contentType.split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '');
  return `art/${hash}.${ext}`;
}

function publicUrlFor(key) {
  return R2_PUBLIC_URL.replace(/\/$/, '') + '/' + key;
}

// Upload a data URL; returns the public URL (or null if disabled/failed).
async function uploadDataUrl(dataUrl, maxBytes = 4 * 1024 * 1024) {
  const c = getClient();
  if (!c) return null;
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) throw new Error('bad_data_url');
  if (parsed.buffer.length > maxBytes) throw new Error('too_large');
  const key = keyFor(parsed.buffer, parsed.contentType);
  // Skip re-upload if the object already exists (dedupe)
  try {
    await c.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return publicUrlFor(key); // already there
  } catch (e) { /* not found — upload below */ }
  await c.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: parsed.buffer,
    ContentType: parsed.contentType,
    CacheControl: 'public, max-age=31536000, immutable'
  }));
  return publicUrlFor(key);
}

module.exports = { enabled, uploadDataUrl };
