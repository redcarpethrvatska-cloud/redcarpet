import assert from 'node:assert/strict';
import { onRequestGet, onRequestHead } from '../functions/index.php/novosti/item/[slug].js';
import { readFile } from 'node:fs/promises';

const cases = [
  ['12-kako-odrzavati-tepihe-u-hotelima-izmedu-profesionalnih-ciscenja-savjeti-iz-prakse', '/savjeti/zasto-je-redovito-pranje-tepisona-vazno/'],
  ['17-dubinsko-i-kemijsko-ciscenje-tepiha-i-tepisona-profesionalna-usluga-red-carpet-hrvatska', '/dubinsko-ciscenje-tepisona/'],
  ['23-dubinsko-pranje-tepiha-razlika-koju-se-vidi-i-osjeti', '/dubinsko-ciscenje-tepisona/'],
];
const redirects = await readFile(new URL('../public/_redirects', import.meta.url), 'utf8');
for (const [slug, destination] of cases) {
  for (const handler of [onRequestGet, onRequestHead]) {
    const response = handler({ params: { slug } });
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('Location'), `https://redcarpet.hr${destination}`);
  }
  assert.ok(redirects.includes(`/index.php/novosti/item/${slug} ${destination} 301`));
  const html = await readFile(new URL(`../dist${destination}index.html`, import.meta.url), 'utf8');
  assert.ok(html.includes(`href="https://redcarpet.hr${destination}"`), 'Redirect target must be canonical.');
  assert.doesNotMatch(html, /name="robots" content="[^"]*noindex/);
}
const unknown = onRequestGet({ params: { slug: 'unknown-article' } });
assert.equal(unknown.status, 404);
assert.equal(unknown.headers.get('X-Robots-Tag'), 'noindex');
console.log('Legacy redirect checks passed (GET, HEAD, canonical targets and unknown URL 404).');
