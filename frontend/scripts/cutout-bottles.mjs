import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { removeBackground } from "@imgly/background-removal-node";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsDir = path.join(__dirname, "..", "public", "products");

const files = [
  "amition-x-main.jpg",
  "tazkiah-main.jpg",
  "prime-ryv-main.jpg",
  "crush-on-you-main.jpg",
  "eloura-main.jpg",
  "al-fakhama-main.jpg",
];

await mkdir(productsDir, { recursive: true });

for (const file of files) {
  const inputPath = path.join(productsDir, file);
  const outName = file.replace(/\.jpg$/i, ".png");
  const outputPath = path.join(productsDir, outName);
  console.log(`Cutting ${file} → ${outName}...`);
  const input = await readFile(inputPath);
  const blob = new Blob([input], { type: "image/jpeg" });
  const result = await removeBackground(blob, {
    output: { format: "image/png", quality: 0.95 },
  });
  const buffer = Buffer.from(await result.arrayBuffer());
  await writeFile(outputPath, buffer);
  console.log(`  saved ${outName} (${Math.round(buffer.length / 1024)} KB)`);
}

console.log("Done.");
