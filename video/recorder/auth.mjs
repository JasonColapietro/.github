// Local demo recording: sign in to the localhost dev server with the repo's built-in dev sign-in and save the session.
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const secret = fs.readFileSync("devsecret", "utf8").trim();
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3210/login", { waitUntil: "networkidle", timeout: 180000 });
const form = page.locator('form[action="/auth/dev-sign-in"]');
await form.locator('input[name="email"]').fill("demo@suedeai.ai");
await form.locator('input[name="secret"]').fill(secret);
await Promise.all([page.waitForLoadState("networkidle"), form.locator('button[type="submit"]').click()]);
console.log("after sign-in:", page.url());
await ctx.storageState({ path: "state.json" });
await browser.close();
