# Google Drive → Red Carpet portfolio (experimental)

## Current status
The import is implemented but **not active** until Google OAuth secrets are configured and an end-to-end test succeeds. It never publishes directly; each run creates a draft pull request requiring review and explicit approval.

## Inbox
Folder: `NOVI IZVEDENI RADOVI – ZA OBJAVU`
ID: `176WxBLQLQRuol53R-dvBw7rD8AjhSNCU`

Place each project in its own named subfolder with photos, optional video clips and a UTF-8 text file `opis.txt`. The text must describe verified work and be at least 30 characters. The folder name becomes the public title and URL slug. Do not include identifiable hotel/client names without publication permission. Projects without `opis.txt` or photographs are ignored.

## One-time OAuth setup
A Google OAuth client with **read-only Google Drive** access and an offline refresh token is required. Store the three values **only** in GitHub repository Actions secrets:
- `GOOGLE_DRIVE_CLIENT_ID`
- `GOOGLE_DRIVE_CLIENT_SECRET`
- `GOOGLE_DRIVE_REFRESH_TOKEN`

Never put these values into source files, PR comments, chat, or logs. Access is limited to the Drive identity used during OAuth; keep its Drive permissions limited to the relevant project inbox. OAuth configuration and secure authorization are not yet completed.

## Running and reviewing
After secrets are set, run GitHub Actions → *Import new Red Carpet projects from Google Drive* → *Run workflow*. The Action downloads media to ephemeral runner storage, converts images to WebP and videos to MP4, and updates `src/data/autoIzvedeniRadovi.json` on a **new draft PR**. Original Drive media is neither edited nor deleted. Its source folder ID and slug prevent duplicate imports.

The generated text uses only the Drive folder title and `opis.txt`; it does **not** claim to use an AI writer. Review all descriptions, location, services and photo order. The first image (alphabetical original filename) becomes the cover. Review the draft PR and preview; approval is mandatory before production merge.

## Security / limitations
No secrets or sharing tokens in committed files. File and video size bounds prevent very large uploads. This MVP imports only regular image/video files and text descriptions. A 100 MB GitHub file limit applies, so output videos must be kept below that size; a further automated file-size guard should be applied before unattended operation. No hourly schedule is enabled until OAuth, end-to-end media checks, quotas and PR review are verified.
