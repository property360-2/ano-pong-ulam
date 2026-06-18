/**
 * scripts/generate-icons.js
 * Generates PNG icons from public/icon.svg at various sizes for PWA manifest
 * and apple-touch-icon. Run with: node scripts/generate-icons.js
 */
const sharp = require("sharp")
const fs = require("fs")
const path = require("path")

const SIZES = [
  { name: "icon-192", size: 192 },
  { name: "icon-512", size: 512 },
  { name: "apple-touch-icon", size: 180 },
]

async function main() {
  const svgPath = path.join(__dirname, "..", "public", "icon.svg")
  const svgBuffer = fs.readFileSync(svgPath)

  for (const { name, size } of SIZES) {
    const outputPath = path.join(__dirname, "..", "public", `${name}.png`)
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath)
    console.log(`Generated ${outputPath} (${size}x${size})`)
  }
}

main().catch((err) => {
  console.error("Icon generation failed:", err)
  process.exit(1)
})
