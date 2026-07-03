# InnaYa Design Studio — website

Photo-led interior design studio site: **Next.js 16 (App Router)**, **Tailwind CSS 4**, **next-intl** (English, Ukrainian, Russian), **react-icons**, and curated **Pexels** placeholder images until real project photography is added.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000` — you will be redirected to a locale prefix (`/en`, `/uk`, `/ru`).

## Environment variables

See `.env.example` for all keys. On Vercel, set:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Production domain for SEO (sitemap, canonical URLs, Open Graph) |
| `KEYSTATIC_GITHUB_REPO` | `owner/repo-name` |
| `KEYSTATIC_GITHUB_CLIENT_ID` | GitHub App client ID |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | GitHub App client secret |
| `KEYSTATIC_SECRET` | Random string (e.g. `openssl rand -hex 32`) |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | GitHub App slug (e.g. `innayastudio`) |

Never commit `.env.local`. Rotate any secret that was shared in chat or logs.

## Content & i18n

- Copy lives in `messages/en.json`, `messages/uk.json`, and `messages/ru.json`.
- Portfolio projects are managed in [`content/projects/*.yaml`](content/projects/) via the portfolio admin at `/edit`.
- Add `public/logo.png` when the client asset is ready (header currently uses the translated brand name).

## Portfolio admin (Keystatic)

Inna can add and edit portfolio projects in the browser at **`/edit`** (e.g. `https://your-site.vercel.app/edit`).

### What you can edit

In **`/edit` → Pages** you can manage:

- **Home** — hero background video
- **Portfolio** — projects (slug, year, area, EN/UK/RU text, cover, gallery)
- **About** — studio bio in all three languages and background image
- **Technologies** — Revit/VR section images, Leica YouTube video ID, and page copy in all three languages
- **Contact** — email, phone numbers, Instagram, TikTok

Each portfolio project includes:

- **Slug** (URL), year, optional area (m²)
- **Language tabs** (English / Ukrainian / Russian) for title, location, excerpt, typology, and optional status
- **Cover image** with alt text and orientation
- **Gallery** — choose Image or Video per item; video items show a cover-thumbnail field only when Video is selected. Drag items to reorder, or drag files onto upload areas.

Published changes appear on the live site after Vercel finishes redeploying (usually 1–2 minutes).

### First-time setup (developer)

1. Create a [GitHub App](https://github.com/settings/apps/new) (not an OAuth App) with callback URL  
   `https://your-site.vercel.app/api/keystatic/github/oauth/callback`  
   (use `http://localhost:3000/api/keystatic/github/oauth/callback` for local testing).
2. Under **Where can this GitHub App be installed?**, choose **Any account** (required for collaborators).
3. Enable **Request user authorization (OAuth) during installation** and **Expire user authorization tokens** (Optional Features).
4. Install the app on your repo and add environment variables in Vercel (and `.env.local` for local GitHub mode):

   | Variable | Purpose |
   |----------|---------|
   | `NEXT_PUBLIC_SITE_URL` | Production domain |
   | `KEYSTATIC_GITHUB_REPO` | `owner/repo-name` |
   | `KEYSTATIC_GITHUB_CLIENT_ID` | GitHub App client ID |
   | `KEYSTATIC_GITHUB_CLIENT_SECRET` | GitHub App client secret |
   | `KEYSTATIC_SECRET` | Random string (e.g. `openssl rand -hex 32`) |
   | `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | GitHub App slug |

5. Add Inna's GitHub account as a **collaborator** on the repository (write access).
6. Redeploy. Inna signs in at `/edit` with GitHub to edit content.

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
