const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Round to one decimal to keep the SVG markup tidy.
const r = (n) => Math.round(n * 10) / 10;

// SVG template — the Hoo "Symbol C" mark (kissing nodes + diamond spark).
// Matches the canonical 200x200 mark in public/logo.svg / public/icon.svg,
// scaled to the target size and rendered full-bleed for maskable PWA icons.
function createIconSVG(size) {
  const f = size / 200; // scale factor from the 200x200 master
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-labelledby="hoo-icon-${size}-title">
  <title id="hoo-icon-${size}-title">Hoo symbol — ${size}x${size}</title>
  <rect width="${size}" height="${size}" rx="${r(40 * f)}" fill="#09090B"/>
  <path d="M${r(40 * f)},${r(72 * f)} A${r(34 * f)},${r(34 * f)} 0 0 0 ${r(40 * f)},${r(128 * f)}" fill="none" stroke="#00F0FF" stroke-width="${r(6 * f)}" stroke-linecap="round"/>
  <path d="M${r(160 * f)},${r(72 * f)} A${r(34 * f)},${r(34 * f)} 0 0 1 ${r(160 * f)},${r(128 * f)}" fill="none" stroke="#00F0FF" stroke-width="${r(6 * f)}" stroke-linecap="round"/>
  <circle cx="${r(70 * f)}" cy="${r(100 * f)}" r="${r(30 * f)}" fill="none" stroke="#FAFAFA" stroke-width="${r(9 * f)}"/>
  <circle cx="${r(130 * f)}" cy="${r(100 * f)}" r="${r(30 * f)}" fill="none" stroke="#FAFAFA" stroke-width="${r(9 * f)}"/>
  <polygon points="${r(100 * f)},${r(89 * f)} ${r(111 * f)},${r(100 * f)} ${r(100 * f)},${r(111 * f)} ${r(89 * f)},${r(100 * f)}" fill="#00F0FF"/>
</svg>`;
}

// Generate SVG files for each size
sizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(__dirname, 'icons', filename);

  fs.writeFileSync(filepath, svgContent);
  console.log(`Created ${filename}`);
});

console.log('\nSVG icons created!');
console.log('To convert to PNG, run: bun run scripts/convert-icons.ts');
