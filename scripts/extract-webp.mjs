// Decodes the animated WebP into a numbered PNG frame sequence using sharp.
// Usage: node scripts/extract-webp.mjs <input.webp> <outDir>
import sharp from 'sharp';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const input = process.argv[2];
const outDir = process.argv[3] ?? '_frames';

if (!input) {
  console.error('Provide an input .webp path');
  process.exit(1);
}

const meta = await sharp(input, { animated: true, limitInputPixels: false }).metadata();
const pages = meta.pages ?? 1;
const delays = meta.delay ?? [];
const totalMs = delays.reduce((a, b) => a + b, 0);

console.log(JSON.stringify({
  width: meta.width,
  frameHeight: meta.pageHeight ?? meta.height,
  pages,
  totalMs,
  fps: totalMs ? +(pages / (totalMs / 1000)).toFixed(2) : null,
  firstDelays: delays.slice(0, 5),
}, null, 2));

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const pad = String(pages).length;
for (let i = 0; i < pages; i++) {
  const name = `f_${String(i + 1).padStart(pad, '0')}.png`;
  await sharp(input, { page: i, limitInputPixels: false }).png().toFile(path.join(outDir, name));
}
console.log(`Wrote ${pages} frames to ${outDir}`);
