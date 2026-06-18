const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const sizes = [48, 72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, "..", "public", "icons");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const svg = fs.readFileSync(path.join(__dirname, "..", "public", "favicon.svg"), "utf-8");

async function run() {
  for (const size of sizes) {
    const buffer = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
    fs.writeFileSync(path.join(outDir, `icon-${size}x${size}.png`), buffer);
    console.log(`Created icon-${size}x${size}.png`);
  }
  // Create a copy of 152 as apple-touch-icon
  const apple = await sharp(Buffer.from(svg)).resize(152, 152).png().toBuffer();
  fs.writeFileSync(path.join(outDir, "apple-touch-icon.png"), apple);
  console.log("Created apple-touch-icon.png");
}

run().catch(console.error);
