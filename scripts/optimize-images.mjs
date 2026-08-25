import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = 'public/images';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

for (const file of files) {
  const input = path.join(dir, file);
  const dest = path.join(dir, file.replace(/\.png$/, '.webp'));
  const meta = await sharp(input).metadata();
  const width = meta.width > 1600 ? 1600 : meta.width;
  await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(dest);
  const orig = fs.statSync(input).size;
  const next = fs.statSync(dest).size;
  console.log(`${file}: ${(orig/1024/1024).toFixed(2)}MB -> ${(next/1024).toFixed(0)}KB`);
}
