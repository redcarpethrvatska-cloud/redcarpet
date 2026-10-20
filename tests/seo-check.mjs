import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { radovi } from '../src/data/izvedeniRadovi.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const origin = 'https://redcarpet.hr';

const b2bPaths = [
  '/',
  '/dubinsko-ciscenje-tepisona/',
  '/ciscenje-hotela/',
  '/ciscenje-domova-za-starije/',
  '/ciscenje-vrtica-i-skola/',
  '/ciscenje-poslovnih-prostora/',
  '/ciscenje-tapeciranih-stolica/',
  '/ciscenje-madraca-za-ustanove/',
  '/impregnacija-tekstila/',
  '/suradnja-s-kooperantima/',
  '/izvedeni-radovi/',
];

const projectPaths = radovi.map(({ slug }) => `/izvedeni-radovi/${slug}/`);
assert.equal(projectPaths.length, 15, 'Očekivano je točno 15 javnih projekata.');

const htmlPathFor = (urlPath) => urlPath === '/'
  ? path.join(dist, 'index.html')
  : path.join(dist, ...urlPath.split('/').filter(Boolean), 'index.html');

const canonicalFrom = (html) => html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
const robotsFrom = (html) => html.match(/<meta name="robots" content="([^"]+)"/i)?.[1] ?? '';

for (const urlPath of [...b2bPaths, ...projectPaths]) {
  const html = await readFile(htmlPathFor(urlPath), 'utf8');
  assert.doesNotMatch(robotsFrom(html), /(?:^|\s|,)noindex(?:\s|,|$)/i, `${urlPath} ne smije biti noindex.`);
  assert.equal(canonicalFrom(html), `${origin}${urlPath}`, `${urlPath} mora imati vlastiti kanonski URL.`);
}

const portfolioHtml = await readFile(htmlPathFor('/izvedeni-radovi/'), 'utf8');
for (const projectPath of projectPaths) {
  assert.match(portfolioHtml, new RegExp(`href="${projectPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`), `Nedostaje interni link na ${projectPath}`);
}

const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, 'Sitemap ne smije sadržavati duplikate.');

for (const url of sitemapUrls) {
  assert.ok(url.startsWith(`${origin}/`), `Sitemap URL mora biti na kanonskoj domeni: ${url}`);
  const urlPath = new URL(url).pathname;
  assert.ok(urlPath.endsWith('/'), `Kanonski sitemap URL mora završavati kosom crtom: ${url}`);
  const html = await readFile(htmlPathFor(urlPath), 'utf8');
  assert.equal(canonicalFrom(html), url, `Sitemap URL nije jednak canonical oznaci: ${url}`);
  assert.doesNotMatch(robotsFrom(html), /(?:^|\s|,)noindex(?:\s|,|$)/i, `Sitemap ne smije sadržavati noindex URL: ${url}`);
}

for (const requiredPath of [...b2bPaths, ...projectPaths]) {
  assert.ok(sitemapUrls.includes(`${origin}${requiredPath}`), `Sitemap ne sadrži ${requiredPath}`);
}

const robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
assert.match(robots, /^User-agent:\s*\*$/im);
assert.match(robots, /^Allow:\s*\/$/im);
assert.match(robots, /^Sitemap:\s*https:\/\/redcarpet\.hr\/sitemap\.xml$/im);

async function findHeaders(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = await findHeaders(fullPath);
      if (nested) return nested;
    } else if (entry.name === '_headers') {
      return fullPath;
    }
  }
}

const headersPath = await findHeaders(dist);
if (headersPath) {
  const headers = await readFile(headersPath, 'utf8');
  assert.doesNotMatch(headers, /x-robots-tag\s*:\s*[^\r\n]*noindex/i, 'Cloudflare _headers ne smije nenamjerno slati noindex.');
}

console.log(`SEO provjera prošla: ${b2bPaths.length} javnih B2B URL-ova, ${projectPaths.length} projekata i ${sitemapUrls.length} sitemap URL-ova.`);
