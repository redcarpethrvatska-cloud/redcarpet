import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const source = path.join('src','media-parts','hotel-80-soba');
const destination = path.join('public','media','izvedeni-radovi','kemijsko-ciscenje-tepisona-hotel-80-soba','hotel-80-soba-video-web.mp4');
const expectedSha256 = '60b2e0f5b1a14bbc5823cd33111da7ac25e249867fc8f0d2f67737ec6d87d57a';
const expectedBytes = 3566885;
const parts = fs.readdirSync(source).filter(f => /^part-\d{2}\.bin$/.test(f)).sort();
if (parts.length !== 12) throw new Error('Incomplete portfolio video chunks');
const buffers = parts.map(f => fs.readFileSync(path.join(source,f)));
const video = Buffer.concat(buffers);
if (video.length !== expectedBytes || createHash('sha256').update(video).digest('hex') !== expectedSha256) {
  throw new Error('Portfolio video integrity check failed');
}
fs.mkdirSync(path.dirname(destination), {recursive:true});
fs.writeFileSync(destination,video);
console.log('Verified and assembled hotel video: ' + video.length + ' bytes');
