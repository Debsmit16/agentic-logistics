/**
 * Generates PNG brand assets from public/logo-source.jpg
 * Run: node scripts/generate-brand-assets.mjs
 */
import sharp from "sharp";
import { mkdir, copyFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const source = path.join(root, "public", "logo-source.jpg");

const pipeline = sharp(source)
  .rotate()
  .sharpen({ sigma: 0.6 })
  .png({ compressionLevel: 9, adaptiveFiltering: true });

async function writePng(outPath, size, fit = "contain") {
  await mkdir(path.dirname(outPath), { recursive: true });
  await pipeline
    .clone()
    .resize(size, size, {
      fit,
      background: { r: 10, g: 22, b: 40, alpha: 1 },
    })
    .toFile(outPath);
  console.log("wrote", outPath);
}

await writePng(path.join(root, "public", "logo.png"), 1024);
await writePng(path.join(root, "public", "logo-512.png"), 512);
await writePng(path.join(root, "public", "logo-192.png"), 192);
await writePng(path.join(root, "public", "logo-128.png"), 128);
await writePng(path.join(root, "public", "logo-64.png"), 64);
await writePng(path.join(root, "public", "logo-32.png"), 32);

await writePng(path.join(root, "src", "app", "icon.png"), 32);
await writePng(path.join(root, "src", "app", "apple-icon.png"), 180);

await copyFile(
  path.join(root, "public", "logo-512.png"),
  path.join(root, "public", "og-image.png"),
);

console.log("Brand assets ready.");
