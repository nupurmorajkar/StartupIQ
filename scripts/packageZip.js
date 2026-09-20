import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const archiver = require("archiver");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(rootDir, "..");

const zipPaths = [
  path.join(rootDir, "Growly_MERN_Fullstack.zip"),
  path.join(workspaceRoot, "Growly_MERN_Fullstack.zip"),
];

async function createZip(outPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(
        `📦 Created ${path.basename(outPath)} (${(archive.pointer() / 1024).toFixed(1)} KB) at: ${outPath}`
      );
      resolve();
    });

    archive.on("error", (err) => reject(err));
    archive.pipe(output);

    archive.glob("**/*", {
      cwd: rootDir,
      ignore: [
        "node_modules/**",
        "dist/**",
        ".git/**",
        "*.zip",
        ".system_generated/**",
        "scratch/**",
      ],
      dot: true,
    });

    archive.finalize();
  });
}

async function run() {
  for (const p of zipPaths) {
    await createZip(p);
  }
}

run().catch((e) => {
  console.error("Packaging error:", e);
  process.exit(1);
});
