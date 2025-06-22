import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "dist");

console.log("🔄 Watching for extension changes...");
console.log("📁 Watching directory:", distPath);
console.log(
  "💡 Make changes to your source files and the extension will rebuild automatically!"
);
console.log(
  "⚠️  You may need to manually reload the extension in chrome://extensions/"
);

// Watch the dist directory for changes
fs.watch(distPath, { recursive: true }, (eventType, filename) => {
  if (filename) {
    console.log(
      `📝 File ${filename} changed at ${new Date().toLocaleTimeString()}`
    );
    console.log(
      "🔄 Extension rebuilt! You may need to reload it in chrome://extensions/"
    );
    console.log(
      "💡 Tip: Click the refresh button on your extension in chrome://extensions/"
    );
  }
});

// Keep the process running
process.on("SIGINT", () => {
  console.log("\n👋 Stopping extension watcher...");
  process.exit(0);
});
