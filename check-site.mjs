#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const publicFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "docs/index.html",
  "docs/docs.js",
  "docs/docs.css",
  "docs/content/overview.md",
  "docs/content/quickstart.md",
  "docs/content/http-api.md",
  "docs/content/api-gateway-design.md",
];

const bannedPublicCopy = [
  /sirdath\/neurovault-core/i,
  /coming to the Mac App Store/i,
  /Desktop is coming/i,
  /100% local/i,
  /97\.45% accuracy/i,
];

const read = (path) => readFile(resolve(root, path), "utf8");

for (const path of publicFiles) {
  const source = await read(path);
  for (const pattern of bannedPublicCopy) {
    if (pattern.test(source)) {
      throw new Error(`${path} contains obsolete or inaccurate public copy: ${pattern}`);
    }
  }
}

const homepage = await read("index.html");
const macDmgUrl = "https://github.com/sirdath/NeuroVault/releases/download/v0.6.0/NeuroVault_0.6.0_aarch64.dmg";
if ((homepage.match(/<h1\b/gi) ?? []).length !== 1) {
  throw new Error("index.html must contain exactly one h1");
}
if (!homepage.includes("https://github.com/sirdath/NeuroVault")) {
  throw new Error("index.html must link to the canonical NeuroVault repository");
}
if (!homepage.includes("assets/neurovault-mark.png")) {
  throw new Error("index.html must use the transparent NeuroVault product mark");
}
if ((homepage.match(/data-mac-download/g) ?? []).length !== 4) {
  throw new Error("index.html must expose four direct Mac download buttons");
}
if ((homepage.match(new RegExp(macDmgUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length !== 4) {
  throw new Error("Every homepage Mac download button must target the signed DMG directly");
}
if (!homepage.includes('href="https://github.com/sirdath/NeuroVault"')) {
  throw new Error("index.html must keep a separate link to the GitHub repository");
}
const publicPages = ["index.html", "docs/index.html"];
let localReferenceCount = 0;

for (const page of publicPages) {
  const source = await read(page);
  if (/<script[^>]+src=["']https?:/i.test(source)) {
    throw new Error(`${page} must not depend on remote JavaScript`);
  }

  const pageDirectory = dirname(resolve(root, page));
  const references = [...source.matchAll(/(?:href|src)=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((value) => !/^(?:https?:|mailto:|#|data:)/i.test(value))
    .map((value) => value.split(/[?#]/, 1)[0])
    .filter(Boolean);

  for (const reference of new Set(references)) {
    const target = reference.endsWith("/") ? `${reference}index.html` : reference;
    await access(resolve(pageDirectory, target));
    localReferenceCount += 1;
  }
}

const workflow = await read(".github/workflows/pages.yml");
for (const asset of ["neurovault-mark.png", "product-editor.webp", "product-graph-3d.webp", "product-today.webp"]) {
  if (!workflow.includes(asset)) {
    throw new Error(`Pages workflow does not deploy ${asset}`);
  }
}

console.log(`Site check passed: ${publicFiles.length} public files and ${localReferenceCount} local references verified.`);
