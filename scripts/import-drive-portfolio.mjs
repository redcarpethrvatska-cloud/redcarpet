import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const rootFolder = process.env.DRIVE_INBOX_FOLDER_ID || '176WxBLQLQRuol53R-dvBw7rD8AjhSNCU';
const dryRun = process.argv.includes('--dry-run');
const outputFile = 'src/data/autoIzvedeniRadovi.json';
const mediaRoot = 'public/media/izvedeni-radovi';
const database = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
const legacy = fs.readFileSync('src/data/izvedeniRadovi.js', 'utf8');
const legacyMap = JSON.parse(fs.readFileSync('src/data/portfolioMediaMap.json', 'utf8'));
const log = (...items) => console.log('[portfolio]', ...items);
const requiredEnv = ['GOOGLE_DRIVE_CLIENT_ID','GOOGLE_DRIVE_CLIENT_SECRET','GOOGLE_DRIVE_REFRESH_TOKEN'];
if (requiredEnv.some(key => !process.env[key])) throw new Error('Google Drive OAuth credentials not configured in Actions secrets');
const tokenResult = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST', headers: {'content-type':'application/x-www-form-urlencoded'},
  body: new URLSearchParams({
    client_id: process.env.GOOGLE_DRIVE_CLIENT_ID,
    client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  }),
});
if (!tokenResult.ok) throw new Error('Google Drive OAuth refresh failed (' + tokenResult.status + ')');
const { access_token: accessToken } = await tokenResult.json();
if (!accessToken) throw new Error('Missing Google Drive access token');

async function drive(endpoint, binary = false) {
  const response = await fetch('https://www.googleapis.com/drive/v3/' + endpoint, {
    headers: { authorization: 'Bearer ' + accessToken },
    signal: AbortSignal.timeout(180000),
  });
  if (!response.ok) throw new Error('Google Drive request failed (' + response.status + ')');
  return binary ? Buffer.from(await response.arrayBuffer()) : response.json();
}
async function list(folder) {
  let pageToken;
  const files = [];
  do {
    const q = encodeURIComponent("'" + folder.replace(/'/g, "\\'") + "' in parents and trashed = false");
    const params = 'q=' + q + '&fields=' + encodeURIComponent('nextPageToken,files(id,name,mimeType,size,md5Checksum,modifiedTime)') + '&pageSize=100' + (pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : '');
    const result = await drive('files?' + params);
    files.push(...(result.files || []));
    pageToken = result.nextPageToken;
  } while (pageToken);
  return files;
}
const slugify = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,90);
const escapeText = value => String(value).trim().replace(/\s+/g, ' ');
const extensions = /\.(jpe?g|png|webp|heic|heif)$/i;
const videoExt = /\.(mp4|mov|m4v|avi)$/i;
const exec = (...args) => execFileSync(args[0], args.slice(1), { stdio:'pipe', timeout:180000 });
const knownFolders = new Set(database.projects.map(p => p.sourceFolderId));
const knownSlugs = new Set([...Object.keys(legacyMap), ...database.projects.map(p => p.slug)]);
const inbox = await list(rootFolder);
const folders = inbox.filter(x => x.mimeType === 'application/vnd.google-apps.folder').sort((a,b)=>a.name.localeCompare(b.name));
let imported = 0;
for (const folder of folders) {
  if (knownFolders.has(folder.id)) { log('Already imported:', folder.name); continue; }
  const files = await list(folder.id);
  const desc = files.find(f => /^opis\.txt$/i.test(f.name) && f.mimeType === 'text/plain');
  const photos = files.filter(f => extensions.test(f.name) && f.mimeType.startsWith('image/'));
  const videos = files.filter(f => videoExt.test(f.name) && f.mimeType.startsWith('video/'));
  if (!desc || !photos.length) { log('SKIP incomplete (opis.txt + photo required):', folder.name); continue; }
  const description = escapeText((await drive('files/' + encodeURIComponent(desc.id) + '?alt=media', true)).toString('utf8'));
  if (description.length < 30 || description.length > 1800) { log('SKIP description length:', folder.name); continue; }
  const slug = slugify(folder.name);
  if (!slug || knownSlugs.has(slug) || legacy.includes('"slug":"' + slug + '"')) { log('SKIP duplicate slug:', folder.name); continue; }
  if (photos.length > 25 || videos.length > 5) { log('SKIP too many media files:', folder.name); continue; }
  const title = escapeText(folder.name);
  if (title.length > 110) { log('SKIP title too long:', folder.name); continue; }
  const mediaDirectory = path.join(mediaRoot,slug);
  if (fs.existsSync(mediaDirectory)) { log('SKIP existing media path:',slug); continue; }
  if (dryRun) { log('READY:',folder.name,photos.length,'photos',videos.length,'videos'); imported++; continue; }
  fs.mkdirSync(mediaDirectory,{recursive:true});
  const processedImages = [], processedVideos = [];
  let success = false;
  try {
    const ordered = [...photos].sort((a,b)=>a.name.localeCompare(b.name));
    const all = [...ordered, ...videos.sort((a,b)=>a.name.localeCompare(b.name))];
    for (const [index,file] of all.entries()) {
      const size = Number(file.size || 0);
      if (!size || size > 120 * 1024 * 1024) throw new Error('Unsupported media size for ' + file.name);
      const content = await drive('files/' + encodeURIComponent(file.id) + '?alt=media',true);
      if (content.length !== size) throw new Error('Download size mismatch: ' + file.name);
      const tempFile = path.join(os.tmpdir(), 'rc-'+process.pid+'-'+index+path.extname(file.name).toLowerCase());
      fs.writeFileSync(tempFile,content,{flag:'wx'});
      const isPhoto = ordered.includes(file);
      const filename = slug + '-' + String(isPhoto ? processedImages.length+1 : processedVideos.length+1).padStart(2,'0') + (isPhoto ? '.webp' : '.mp4');
      const destination = path.join(mediaDirectory,filename);
      if (isPhoto) {
        exec('ffmpeg','-hide_banner','-loglevel','error','-y','-i',tempFile,'-frames:v','1','-vf','scale=1600:1600:force_original_aspect_ratio=decrease','-c:v','libwebp','-quality','80',destination);
        processedImages.push({path:'/'+mediaDirectory+'/'+filename,alt:title + ' – fotografija izvedenih radova ' + (processedImages.length+1),original:file.name});
      } else {
        exec('ffmpeg','-hide_banner','-loglevel','error','-y','-i',tempFile,'-map','0:v:0','-map','0:a:0?','-vf','scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2','-c:v','libx264','-preset','veryfast','-crf','28','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart',destination);
        processedVideos.push({path:'/'+mediaDirectory+'/'+filename,original:file.name});
      }
      exec('ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1',destination);
      if (fs.statSync(destination).size < 1000) throw new Error('Empty optimized media');
      fs.unlinkSync(tempFile);
    }
    const summary = description.slice(0,220);
    const record = {
      sourceFolderId:folder.id,slug,title,category:'Poslovni objekti',
      summary,description,steps:[description],images:[],video:null,
      seoTitle:(title+' | Red Carpet').slice(0,70),
      metaDescription:(description+' | Red Carpet').slice(0,160),
      h1:title,intro:description,scope:description,
      planning:'Za slične B2B projekte pošaljite lokaciju, fotografije, opseg radova i željeni termin.',
    };
    database.projects.unshift(record);
    database.media[slug] = {title,images:processedImages,videos:processedVideos};
    knownFolders.add(folder.id);
    knownSlugs.add(slug);
    imported++;
    success = true;
    log('Prepared:',slug);
  } finally {
    if (!success) fs.rmSync(mediaDirectory,{recursive:true,force:true});
  }
}
if (!dryRun && imported) {
  fs.writeFileSync(outputFile,JSON.stringify(database,null,2)+'\n');
}
log('New projects:',imported);
