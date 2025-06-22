import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "dist");

console.log("🚀 Auto-reload extension development mode started!");
console.log("📁 Watching directory:", distPath);
console.log(
  "💡 Make changes to your source files and the extension will rebuild and reload automatically!"
);

// Store the extension ID (you'll need to set this after first load)
let extensionId = null;

// Function to get extension ID from Chrome
async function getExtensionId() {
  try {
    // This requires the extension to be loaded first
    // You'll need to manually load it once, then this script will remember the ID
    const manifestPath = path.join(distPath, "manifest.json");
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      console.log("📋 Extension name:", manifest.name);
      console.log("📋 Extension version:", manifest.version);
    }

    // For now, we'll just notify about changes
    console.log(
      "💡 After loading the extension, you can set the extension ID here for auto-reload"
    );
  } catch (error) {
    console.log("❌ Could not read manifest:", error.message);
  }
}

// Watch the dist directory for changes
fs.watch(distPath, { recursive: true }, (eventType, filename) => {
  if (filename && !filename.includes(".DS_Store")) {
    console.log(
      `\n📝 File ${filename} changed at ${new Date().toLocaleTimeString()}`
    );
    console.log("🔄 Extension rebuilt!");

    if (extensionId) {
      console.log("🔄 Auto-reloading extension...");
      // Here you could add Chrome extension management API calls
    } else {
      console.log(
        "💡 Please reload the extension manually in chrome://extensions/"
      );
      console.log("💡 Click the refresh button on your extension");
    }

    console.log("✅ Ready for next change...\n");
  }
});

// Initialize
getExtensionId();

// Keep the process running
process.on("SIGINT", () => {
  console.log("\n👋 Stopping auto-reload watcher...");
  process.exit(0);
});

console.log("\n🎯 Development workflow:");
console.log("1. Make changes to your source files");
console.log("2. Extension will rebuild automatically");
console.log("3. Reload the extension in chrome://extensions/");
console.log("4. Test your changes!");
console.log("\n⏳ Waiting for changes...\n");
