import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/validate-portfolio-intake.mjs <manifest.json>');
  process.exit(2);
}
const fail = (reason) => { throw new Error(`Invalid portfolio intake: ${reason}`); };
const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
const required = ['slug', 'title', 'location', 'category', 'summary', 'description', 'seoTitle', 'metaDescription', 'intro', 'scope', 'planning'];
for (const key of required) {
  if (typeof manifest[key] !== 'string' || !manifest[key].trim()) fail(`missing ${key}`);
}
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.slug)) fail('slug must use lower-case ASCII letters, numbers and hyphens');
if (manifest.seoTitle.length > 70) fail('SEO title exceeds 70 characters');
if (manifest.metaDescription.length > 165) fail('meta description exceeds 165 characters');
if (!Array.isArray(manifest.steps) || !manifest.steps.length || manifest.steps.some(s => typeof s !== 'string' || !s.trim())) fail('steps required');
if (!Array.isArray(manifest.images) || !manifest.images.length) fail('at least one image required');
if (manifest.videos !== undefined && !Array.isArray(manifest.videos)) fail('videos must be an array');
const media = [...manifest.images, ...(manifest.videos || [])];
const names = new Set();
for (const entry of media) {
  if (typeof entry?.file !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(entry.file) || entry.file.includes('..')) fail('invalid media filename');
  if (names.has(entry.file)) fail('duplicate media filename');
  names.add(entry.file);
  const isImage = manifest.images.includes(entry);
  if (!entry.file.toLowerCase().endsWith(isImage ? '.webp' : '.mp4')) fail('media must be optimized WebP or MP4');
  if (isImage && (typeof entry.alt !== 'string' || !entry.alt.trim())) fail('image ALT text required');
  const mediaPath = path.join('public', 'media', 'izvedeni-radovi', manifest.slug, entry.file);
  if (!fs.existsSync(mediaPath)) fail(`missing media: ${mediaPath}`);
  if (!fs.statSync(mediaPath).size) fail(`empty media: ${mediaPath}`);
}
const current = fs.readFileSync('src/data/izvedeniRadovi.js', 'utf8');
const map = JSON.parse(fs.readFileSync('src/data/portfolioMediaMap.json', 'utf8'));
if (Object.hasOwn(map, manifest.slug) || current.includes(JSON.stringify(manifest.slug)) || current.includes(`slug:'${manifest.slug}'`) || current.includes(`slug: '${manifest.slug}'`)) {
  fail('project slug already exists; existing projects must never be overwritten');
}
console.log(`Validated new project ${manifest.slug}: ${manifest.images.length} images and ${(manifest.videos || []).length} videos`);
