import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { render } from "./render.js";
import { renderOrbit } from "./render-orbit.js";
import { assetHashes } from "./release-assets.js";

const root = path.resolve(".");
const src = path.join(root, "src");
const dist = path.join(root, "dist");

if (!existsSync(src)) {
  throw new Error("Missing src directory");
}

await render();
await renderOrbit();
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(src, dist, { recursive: true });
const sourceCommit = process.env.GITHUB_SHA || null;
if (sourceCommit !== null && !/^[a-f0-9]{40}$/i.test(sourceCommit)) throw new Error('GITHUB_SHA must be a full Git commit SHA');
await writeFile(path.join(dist, 'release-manifest.json'), JSON.stringify({
  schemaVersion: 1, sourceCommit, assetSHA256: await assetHashes(dist),
}, null, 2) + '\n');

console.log(`Built static site to ${path.relative(root, dist)}`);
