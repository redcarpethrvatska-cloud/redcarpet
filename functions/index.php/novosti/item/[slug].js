// Redirect specifically identified legacy Joomla articles to the relevant B2B service.
// Other slugs return 404 instead of silently serving a duplicate of the home page.
const legacySlugs = new Set([
  '23-dubinsko-pranje-tepiha-razlika-koju-se-vidi-i-osjeti',
  '17-dubinsko-i-kemijsko-ciscenje-tepiha-i-tepisona-profesionalna-usluga-red-carpet-hrvatska',
]);
export function onRequestGet({ params }) {
  if (legacySlugs.has(params.slug)) {
    return new Response(null, {
      status: 301,
      headers: {
        Location: 'https://redcarpet.hr/dubinsko-ciscenje-tepisona/',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
  return new Response('Stranica nije pronađena.', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' },
  });
}
