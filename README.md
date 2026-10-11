# Red Carpet – B2B web

Official website: https://redcarpet.hr

Astro static site deployed to Cloudflare Pages project `redcarpet`.
Production branch: `main`; build: `npm run build`; output: `dist`.

## B2B contact form

The contact form at `/#kontakt` submits to Cloudflare Pages Function
`functions/api/inquiry.js`, which verifies Cloudflare Turnstile and sends
inquiries with Resend to `redcarpet.hrvatska@gmail.com`.

Set the following variables in **Cloudflare Pages → redcarpet → Settings →
Variables and secrets → Production**:

| Name | Type | Purpose |
| --- | --- | --- |
| `PUBLIC_TURNSTILE_SITE_KEY` | Text | Public Turnstile site key; injected at build time |
| `TURNSTILE_SECRET_KEY` | Secret | Server-side Turnstile verification |
| `RESEND_API_KEY` | Secret | Resend sending API |
| `RESEND_FROM` | Text | Verified sender, e.g. `Red Carpet <upiti@redcarpet.hr>` |

Never commit secret values. Changes to these settings require a **new
Production deployment**, including a rebuild to embed the public Turnstile
key. Check the deployment's success status and send an actual B2B test inquiry.
Do not mark email delivery as working until the inbox confirms receipt.

Resend domain: `redcarpet.hr`; receiving inbox remains Gmail. The site
serves business clients, hotels and institutions, not individual household
carpet-cleaning requests.
