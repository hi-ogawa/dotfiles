#!/usr/bin/env node
// Wraps a PNG in a mock browser window, so a screenshot stands apart from the GitHub page around it.
// Run from a project that has Playwright installed: frame-screenshot.mjs <input.png> <output.png>
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const PADDING = 36;
const BAR_HEIGHT = 44;

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  console.error("usage: frame-screenshot.mjs <input.png> <output.png>");
  process.exit(1);
}

const image = readFileSync(inputPath);
// A PNG stores its width and height at these offsets in the IHDR chunk.
const width = image.readUInt32BE(16);
const height = image.readUInt32BE(20);

const { chromium } = requirePlaywright();
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: {
      width: width + PADDING * 2,
      height: height + BAR_HEIGHT + PADDING * 2,
    },
  });
  await page.setContent(renderFrame(image, width));
  await page.screenshot({ path: outputPath, omitBackground: true });
} finally {
  await browser.close();
}

// This script lives outside the project, so resolve Playwright from the working directory.
function requirePlaywright() {
  const require = createRequire(join(process.cwd(), "package.json"));
  for (const name of ["playwright", "@playwright/test"]) {
    try {
      return require(name);
    } catch (error) {
      if (error.code !== "MODULE_NOT_FOUND") throw error;
    }
  }
  throw new Error("Playwright not found from the working directory");
}

function renderFrame(image, width) {
  const dots = ["#ff5f57", "#febc2e", "#28c840"]
    .map((color) => `<i style="background: ${color}"></i>`)
    .join("");
  return `<!doctype html>
<style>
  html, body { margin: 0; background: transparent; }
  body { padding: ${PADDING}px; }
  .window {
    width: ${width}px; border-radius: 10px; overflow: hidden;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12), 0 14px 36px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.55);
  }
  .bar { display: flex; align-items: center; gap: 8px; height: ${BAR_HEIGHT}px; padding: 0 14px; box-sizing: border-box; background: #2b2b2f; }
  .bar i { width: 12px; height: 12px; border-radius: 50%; }
  img { display: block; }
</style>
<div class="window">
  <div class="bar">${dots}</div>
  <img src="data:image/png;base64,${image.toString("base64")}">
</div>`;
}
