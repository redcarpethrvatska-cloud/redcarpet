// Datumi prvih objava potvrđeni su u povijesti GitHuba (11.10. i 4.11.2026.).
// Ne ažurirati datum samo zbog promjene prikaza ili SEO oznaka.
export const advicePublishedDates = {
  "zasto-je-redovito-pranje-tepisona-vazno": "2026-10-11",
  "koliko-cesto-profesionalno-cistiti-tepisone": "2026-10-11",
  "znakovi-za-dubinsko-ciscenje-tapeciranog-namjestaja": "2026-10-11",
  "koliko-traje-susenje-nakon-dubinskog-pranja": "2026-10-11",
  "kako-pripremiti-poslovni-prostor-za-dubinsko-ciscenje": "2026-10-11",
  "cijena-dubinskog-ciscenja-tepisona-po-m2-poslovni-objekti": "2026-11-04",
  "dubinsko-ciscenje-hotelskih-tepisona-prije-sezone": "2026-11-04",
  "ugovorno-ciscenje-tepisona-poslovne-zgrade": "2026-11-04",
  "ciscenje-300-tapeciranih-stolica-hoteli-restorani": "2026-11-04",
  "profesionalno-ciscenje-konferencijskih-dvorana": "2026-11-04",
  "kako-odabrati-izvodaca-ciscenja-hotelskih-tepisona": "2026-11-04"
};

export function readingMinutes(text) {
  const words = String(text).trim().match(/\S+/g)?.length ?? 0;
  return Math.max(1, Math.ceil(words / 200));
}

export function adviceReadingMinutes(post) {
  const content = [
    post.title,
    post.description,
    ...post.sections.flat(),
    ...post.faq.flat(),
  ].join(' ');
  return readingMinutes(content);
}

export function formatPublishedDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('hr-HR', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, day)));
}
