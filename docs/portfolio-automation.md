# Red Carpet – controlled portfolio intake

## Existing design and content
Existing projects live in `src/data/izvedeniRadovi.js`, SEO copy in `src/data/izvedeniRadoviSeo.js`, and optimized media are referenced from `src/data/portfolioMediaMap.json`. Do not rewrite existing entries.

## Source inbox
Private Google Drive folder: `NOVI IZVEDENI RADOVI – ZA OBJAVU` (folder ID `176WxBLQLQRuol53R-dvBw7rD8AjhSNCU`). Each project is one subfolder. Keep originals untouched.

## Current implementation
This branch introduces a **fail-closed validation stage**, not automated Drive ingestion or publication. A JSON manifest in `intake/` cannot pass validation without a unique slug, full descriptive/SEO fields, all referenced optimized WebP images on disk, and any referenced MP4 videos. Existing slugs are rejected. A GitHub Action checks manifests and the Astro build on PRs.

## Proposed authorized pipeline (not yet configured)
1. Access private Drive with a dedicated least-privilege OAuth identity stored only in GitHub Actions secrets. Never put credentials in code, logs or public URLs.
2. Enumerate subfolders; require a description and explicit ready-for-publication marker, stable file count, and at least one photo.
3. Compare source folder ID and intended slug against the project registry and existing content; block duplicates.
4. Download to temporary runner storage; convert stills to WebP and videos to H.264/AAC MP4, preserving aspect ratio and originals; verify with ffprobe.
5. Generate a draft manifest and SEO description from verified facts, not guessed quantities or client names.
6. Commit **only new project files** to a separate branch, open a draft PR, run verification and preview checks. Keep production merge gated behind approval.
7. After explicit approval, merge and verify the public URL, sitemap, images, videos and mobile layout.

## Current incomplete project
Drive subfolder `Tapacirani namještaj Konferencijska sala opatija`: chemical cleaning of upholstered furniture and all chairs in one conference hall in Opatija. No media were listed by Drive at the time of review, so publication is blocked.
