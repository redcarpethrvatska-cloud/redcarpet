# Aktivacija Red Carpet B2B obrasca (Cloudflare Pages)

Obrazac je implementiran u `src/components/ContactSection.astro`, a poslužiteljski endpoint u `functions/api/inquiry.js`.

## Konfiguracija Cloudflare Pages
- Secret `RESEND_API_KEY`: Resend API ključ.
- Secret `RESEND_FROM`: odobrena pošiljateljska adresa s verificirane domene u Resend servisu (primjer `upiti@redcarpet.hr` tek nakon verifikacije domene). Gmail adresa nije automatski verificirani sender.
- Secret `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile secret.
- Build env `PUBLIC_TURNSTILE_SITE_KEY`: javni Turnstile site key (mora biti dostupan tijekom Astro builda).

Primatelj je uvijek `redcarpet.hrvatska@gmail.com`. Nikada ne dodavati API ključeve u GitHub kod. Dok javni Turnstile ključ nije konfiguriran, obrazac ostaje deaktiviran, a korisnicima je prikazana kontaktna adresa.

## Testiranje prije objave
1. Deploy na neprodukcijski Pages preview s konfiguriranim varijablama i secretima.
2. Poslati valjan testni upit; provjeriti primitak na Gmail i mogućnost odgovora pošiljatelju.
3. Provjeriti nevaljani email/telefon, prazna obvezna polja, honey-pot, lažni/nedostajući Turnstile token, neispravno konfigurirani Resend i prikaz grešaka.
4. Provjeriti obradu podataka, GDPR tekst i rokove čuvanja prije puštanja u produkciju.
5. Za zaštitu od učestalih pokušaja konfigurirati Cloudflare rate limiting na /api/inquiry i provjeriti logove. Sama implementacija nema distribuirani rate limit.

Nema automatske sinkronizacije s CRM-om; to je zasebna faza. GA4 je zasebna integracija i ne smije primati osobne podatke posjetitelja.
