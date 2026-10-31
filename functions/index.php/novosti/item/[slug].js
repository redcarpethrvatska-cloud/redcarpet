// Redirect specifically identified legacy Joomla articles to the relevant modern content.
// Other slugs return 404 instead of silently serving a duplicate of the home page.
const legacyDestinations = new Map([
  ['23-dubinsko-pranje-tepiha-razlika-koju-se-vidi-i-osjeti', '/dubinsko-ciscenje-tepisona/'],
  ['17-dubinsko-i-kemijsko-ciscenje-tepiha-i-tepisona-profesionalna-usluga-red-carpet-hrvatska', '/dubinsko-ciscenje-tepisona/'],
  ['12-kako-odrzavati-tepihe-u-hotelima-izmedu-profesionalnih-ciscenja-savjeti-iz-prakse', '/savjeti/zasto-je-redovito-pranje-tepisona-vazno/'],
]);
export function onRequestGet({ params }) {
  const destination = legacyDestinations.get(params.slug);
  if (destination) {
    return new Response(null, {
      status: 301,
      headers: {
        Location: `https://redcarpet.hr${destination}`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
  return new Response('Stranica nije pronađena.', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' },
  });
}

export const onRequestHead = onRequestGet;
