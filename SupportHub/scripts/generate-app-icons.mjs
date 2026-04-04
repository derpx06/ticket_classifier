/**
 * Regenerates SupportHub app icons (headphones on brand blue — matches login screen).
 * Run from SupportHub: npm run generate-icons
 *
 * Note: Stroke width must stay ~2 inside the scaled group (Lucide default). A large
 * stroke-width inside scale() blows up in SVG rasterizers and can yield a blank PNG.
 */
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, '..', 'assets', 'images');
const tmpDir = path.join(__dirname, '.icon-gen-tmp');

const BRAND = '#2563eb';
const ANDROID_BG = BRAND;

/** Lucide `headphones` (24×24) — single compound path */
const HEADPHONES_D =
  'M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3';

/**
 * Centered glyph: Lucide uses 24×24; scale ~20 → ~480px wide on 1024 canvas.
 * stroke-width 2 × scale 20 ≈ 40px hairline — readable on app icons.
 */
const headphonesGroup = (stroke, strokeWidth) => `
<g fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"
   transform="translate(512,512) scale(20) translate(-12,-12)">
  <path d="${HEADPHONES_D}"/>
</g>`;

const svgFullIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="224" fill="${BRAND}"/>
  ${headphonesGroup('#ffffff', '2.25')}
</svg>`;

const svgForeground = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${headphonesGroup('#ffffff', '2.25')}
</svg>`;

const svgMonochrome = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${headphonesGroup('#000000', '2.25')}
</svg>`;

const svgAndroidBg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="${ANDROID_BG}"/>
</svg>`;

function sharpCli(args) {
  execFileSync('npx', ['--yes', 'sharp-cli', ...args], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
}

async function main() {
  await mkdir(tmpDir, { recursive: true });

  const full = path.join(tmpDir, 'full.svg');
  const fg = path.join(tmpDir, 'fg.svg');
  const mono = path.join(tmpDir, 'mono.svg');
  const bg = path.join(tmpDir, 'android-bg.svg');

  await writeFile(full, svgFullIcon, 'utf8');
  await writeFile(fg, svgForeground, 'utf8');
  await writeFile(mono, svgMonochrome, 'utf8');
  await writeFile(bg, svgAndroidBg, 'utf8');

  sharpCli(['-i', full, '-o', path.join(imagesDir, 'icon.png')]);
  sharpCli(['-i', full, '-o', path.join(imagesDir, 'splash-icon.png'), 'resize', '240', '240']);

  sharpCli(['-i', fg, '-o', path.join(imagesDir, 'android-icon-foreground.png')]);
  sharpCli(['-i', bg, '-o', path.join(imagesDir, 'android-icon-background.png')]);
  sharpCli(['-i', mono, '-o', path.join(imagesDir, 'android-icon-monochrome.png')]);

  sharpCli(['-i', full, '-o', path.join(imagesDir, 'favicon.png'), 'resize', '48', '48']);

  console.log('Wrote icons to assets/images/');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
