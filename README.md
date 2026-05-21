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
- Portfolio slugs are listed in [`content/projects.ts`](content/projects.ts); per-project titles and bodies are under `portfolioItems` in each locale file.
- Add `public/logo.png` when the client asset is ready (header currently uses the translated brand name).

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
