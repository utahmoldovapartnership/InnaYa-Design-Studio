# InnaYa Design Studio — website

Photo-led interior design studio site: **Next.js 16 (App Router)**, **Tailwind CSS 4**, **next-intl** (English, Ukrainian, Russian), **react-icons**, and curated **Pexels** placeholder images until real project photography is added.

## Local development

```bash
npm install
cp .env.example .env.local
# Add Resend keys to enable the contact form.
npm run dev
```

Open `http://localhost:3000` — you will be redirected to a locale prefix (`/en`, `/uk`, `/ru`).

## Environment variables

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Sends contact form inquiries via [Resend](https://resend.com). |
| `RESEND_FROM` | Verified sender address in Resend (e.g. `InnaYa <onboarding@resend.dev>`). |
| `CONTACT_TO` | Optional override for the recipient inbox (defaults to `innaya.d.studio@gmail.com` in code). |

Never commit `.env.local`. Rotate any API key that was shared in chat or logs.

## Content & i18n

- Copy lives in `messages/en.json`, `messages/uk.json`, and `messages/ru.json`.
- Portfolio projects are managed in [`content/projects/*.yaml`](content/projects/) via the portfolio admin at `/edit`.
- Add `public/logo.png` when the client asset is ready (header currently uses the translated brand name).

## Portfolio admin (Keystatic)

Inna can add and edit portfolio projects in the browser at **`/edit`** (e.g. `https://your-site.vercel.app/edit`).

### What you can edit

Each project includes:

- **Slug** (URL), year, optional area (m²)
- **Language tabs** (English / Ukrainian / Russian) for title, location, excerpt, typology, and optional status
- **Cover image** with alt text and orientation
- **Gallery** — choose Image or Video per item; video items show a cover-thumbnail field only when Video is selected. Drag items to reorder, or drag files onto upload areas.

Published changes appear on the live site after Vercel finishes redeploying (usually 1–2 minutes).

### First-time setup (developer)

1. Create a [GitHub OAuth App](https://github.com/settings/developers) with callback URL  
   `https://your-site.vercel.app/api/keystatic/github/oauth/callback`  
   (use `http://localhost:3000/api/keystatic/github/oauth/callback` for local testing).
2. Add these environment variables in Vercel (and `.env.local` for local GitHub mode):

   | Variable | Purpose |
   |----------|---------|
   | `KEYSTATIC_GITHUB_REPO` | `owner/repo-name` |
   | `KEYSTATIC_GITHUB_CLIENT_ID` | OAuth App client ID |
   | `KEYSTATIC_GITHUB_CLIENT_SECRET` | OAuth App client secret |
   | `KEYSTATIC_SECRET` | Random string (e.g. `openssl rand -hex 32`) |
   | `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | GitHub App slug from Keystatic setup |

3. Add Inna's GitHub account as a **collaborator** on the repository (write access).
4. Redeploy. Inna signs in at `/edit` with GitHub to edit projects.

Without these variables on Vercel, **`/edit` is hidden** (404). Local `npm run dev` still works without GitHub for developers.

### Adding a new project

1. Open `/edit` → **Projects** → **Create project**
2. Set the slug (e.g. `my-new-house`) — this becomes `/portfolio/my-new-house`
3. Fill in year, area, and text in all three language tabs
4. Upload a cover image and gallery media (drag to reorder gallery items)
5. For **videos**: set media type to Video, upload the MP4, then add a cover image thumbnail
6. Click **Save** — Vercel rebuilds automatically when using GitHub mode

For very large files or bulk asset prep, send files to the developer as before.

## Vercel

1. Push the repo to GitHub.
2. Create a Vercel project from the repo; set the root directory if this app lives in a subfolder.
3. Add the same environment variables in **Project → Settings → Environment Variables**.
4. Redeploy after changing env vars.

## Scripts

- `npm run dev` — development with Turbopack
- `npm run build` — production build
- `npm run start` — run production build locally
- `npm run lint` — ESLint
