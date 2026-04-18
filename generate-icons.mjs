import sharp from 'sharp';

const sizes = [192, 512];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#e87830"/>
  <text x="50" y="72" font-size="60" text-anchor="middle">🐱</text>
</svg>`;

for (const size of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`public/icon-${size}.png`);
  console.log(`icon-${size}.png を作成しました`);
}