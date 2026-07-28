# Setting up /media/

This adds a password-protected media section at `www.jajm2006.uk/media/`.

- Each **gallery** is its own folder with its own password.
- Files live in **Cloudflare R2** (not in this git repo), so it scales fine as things grow.
- Auth is a real server-side check via **Cloudflare Pages Functions** — someone can't
  bypass it by guessing a direct file URL, the way a client-side-only password popup
  can be bypassed.
- `/media/admin` is a separate admin panel (own password) where you create galleries
  and upload files — no code changes needed to add a new gallery.

One-time setup happens in the Cloudflare dashboard (can't be done from code). It takes
about 10 minutes.

## 1. Create an R2 bucket

Cloudflare dashboard → **R2 Object Storage** → **Create bucket**.
- Name it something like `jajm-media`.
- Leave everything else default.

## 2. Create a KV namespace

Cloudflare dashboard → **Workers & Pages** → **KV** → **Create namespace**.
- Name it something like `jajm-media-kv`.

## 3. Create an R2 API token (for direct uploads)

Cloudflare dashboard → **R2** → **Manage API tokens** → **Create API token**.
- Permissions: **Object Read & Write**, scoped to the bucket you created.
- Save the **Access Key ID** and **Secret Access Key** — you'll need them below.
- Your **Account ID** is shown on the right sidebar of the Cloudflare dashboard.

## 4. Bind R2 + KV to your Pages project

Cloudflare dashboard → your Pages project → **Settings** → **Functions**.
- **R2 bucket bindings** → Add binding:
  - Variable name: `MEDIA_BUCKET`
  - Bucket: the one from step 1
- **KV namespace bindings** → Add binding:
  - Variable name: `MEDIA_KV`
  - Namespace: the one from step 2

## 5. Add environment variables (secrets)

Same **Settings** page → **Environment variables** → add these as **encrypted/secret**
values for the **Production** environment:

| Variable | Value |
|---|---|
| `ADMIN_PASSWORD` | A strong password only you know — this guards `/media/admin` |
| `SESSION_SECRET` | A long random string (e.g. run `openssl rand -hex 32`) — used to sign login cookies |
| `R2_ACCOUNT_ID` | Your Cloudflare account ID (step 3) |
| `R2_ACCESS_KEY_ID` | From the R2 API token (step 3) |
| `R2_SECRET_ACCESS_KEY` | From the R2 API token (step 3) |
| `R2_BUCKET_NAME` | The bucket name from step 1 (e.g. `jajm-media`) |

## 6. Deploy

Push this branch/PR to `main` (or however you normally deploy) — Cloudflare Pages will
rebuild and pick up the new bindings and secrets automatically.

## Using it

- Go to `https://www.jajm2006.uk/media/admin`, log in with `ADMIN_PASSWORD`.
- Create a gallery: give it a name and a password.
- Upload photos/videos to it (progress bar shown; large videos upload directly to R2,
  not through the Worker, so there's no real size ceiling).
- Copy the share link it gives you (`/media/<gallery-slug>/`) and send it to whoever
  needs it, separately from the password.
- They visit the link, enter that gallery's password, and see the photos/videos.
  Their access lasts 14 days (cookie), then they'd need to re-enter the password.

## Testing locally (optional)

`wrangler` is included as a dev dependency. You can run the whole thing locally,
including R2/KV, before deploying:

```
npm run build
npx wrangler pages dev dist --kv MEDIA_KV --r2 MEDIA_BUCKET \
  -b ADMIN_PASSWORD=devpassword -b SESSION_SECRET=devsecretvalue \
  -b R2_ACCOUNT_ID=x -b R2_ACCESS_KEY_ID=x -b R2_SECRET_ACCESS_KEY=x -b R2_BUCKET_NAME=x
```

This uses local, disk-based emulation of KV and R2 — nothing touches your real
Cloudflare account. Note that with fake R2 credentials, the "upload" step itself
(which needs real signed R2 requests) won't succeed locally — this is mainly useful
for testing the gallery/admin UI and auth flow, not real file uploads.

## Notes / things worth knowing

- **The gallery password is shared per-folder, not per-person.** Anyone with the link
  and the password can see everything in that gallery. If you want to revoke access
  for one person without affecting others, you'd need to change that gallery's
  password and re-share it with everyone else who should still have access.
- Galleries and files aren't listed publicly anywhere — someone would need the exact
  link. That said, the link itself isn't a secret in a strong sense (it could end up
  in browser history, a forwarded message, etc.) — the password is what actually
  protects the content.
- This footer on the main site says "no cookies" — that's still true for the rest of
  the site; only `/media/*` sets a (non-tracking, auth-only) cookie. Worth updating
  that footer text if it bothers you.
- R2 storage and Cloudflare Workers/Pages Functions have a generous free tier, but
  large amounts of video will eventually cost something — worth keeping an eye on
  usage in the Cloudflare dashboard if you're uploading a lot.
