# Dodavanje novog izvedenog rada (Red Carpet)

## Podaci za jedan projekt

- Naziv radova i vrsta objekta: hotel, ured, konferencijski centar, restoran i sl.
- Grad/regija; točan naziv klijenta **samo uz dopuštenje**.
- Stvarno obavljeni radovi, podna obloga, približna površina (m²) ili broj komada.
- Posebnosti i potvrđeni rezultati izvedbe (bez izmišljanja statistike).
- 3–8 izvornih fotografija (jedna naslovna) i opcionalni videozapis.
- Dozvola za objavu snimaka, bez osoba, vidljivih dokumenata ili povjerljivih detalja ako nema pristanka.

## Tehnički koraci

1. Dodati novi objekt u polje `projects` datoteke `src/data/izvedeniRadovi.js`. Unijeti jedinstveni `slug`, `title`, `category`, `summary`, `description` i `steps`. Za najnoviji rad objekt staviti na početak polja.
2. U `src/data/izvedeniRadoviSeo.js` dodati ključ istog naziva kao `slug`, s poljima: `seoTitle`, `metaDescription`, `h1`, `intro`, `scope`, `planning`.
3. Fotografije (poželjno optimizirani WebP) i opcionalne MP4 videozapise spremiti u novu mapu `public/media/izvedeni-radovi/<slug>/`. Sačuvati originalne datoteke odvojeno.
4. U `src/data/portfolioMediaMap.json` dodati zapis pod istim `slug`: `images` je polje objekata `{ "path": "/media/izvedeni-radovi/<slug>/naziv.webp", "alt": "Konkretan opis fotografije" }`, a `videos` polje objekata `{ "path": "/media/izvedeni-radovi/<slug>/video-01.mp4" }`. Nizovi mogu biti prazni. **Nedostajući ključ ruši generiranje stranice** jer `izvedeniRadovi.js` izravno čita `mediaMap[project.slug]`.
5. Dodati kanonski URL `https://redcarpet.hr/izvedeni-radovi/<slug>/` u ručno održavani `public/sitemap.xml`. Provjeriti duplikate.
6. Pokrenuti `npm ci`, `npm run build` i `npm run test:seo`. Provjeriti prikaz galerije i videa na mobitelu, pristup medijskim URL-ovima, alt tekstove, interne poveznice i indeksabilnost.
7. Otvoriti PR i pregledati preview. Spajanje u `main` i Cloudflare produkcijska objava isključivo nakon odobrenja.

## Važno

- `src/pages/izvedeni-radovi/index.astro` automatski crta kartice iz `radovi`.
- `src/pages/izvedeni-radovi/[slug].astro` automatski generira podstranicu i povezane projekte.
- Broj projekata na popisu i u SEO opisu sada se čita iz `radovi.length`.
- Postojeći `portfolioMediaMap.json` sadrži nekoliko putanja u mape različite od pripadajućeg `slug`. Prije izmjene starijih galerija treba ručno potvrditi odgovara li fotografija opisanom projektu; nemojte ih prevezivati samo na temelju imena mape.
- Nove podatke i medije obrađivati samo za **Red Carpet**, bez miješanja s drugim brendovima.
