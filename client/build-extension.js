import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy manifest.json to dist
const manifestPath = path.join(__dirname, "public", "manifest.json");
const distManifestPath = path.join(__dirname, "dist", "manifest.json");

if (fs.existsSync(manifestPath)) {
  fs.copyFileSync(manifestPath, distManifestPath);
  console.log("✅ manifest.json copied to dist/");
} else {
  console.log("❌ manifest.json not found in public/");
}

console.log("🎉 Extension build complete!");
