import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const archiveDir = path.resolve(scriptDir, "..");
const pagesDir = path.join(archiveDir, "pages");
const assetsDir = path.join(archiveDir, "assets");
const reportsDir = path.join(archiveDir, "reports");
const sitemapPath = path.join(archiveDir, "raw", "sitemap.xml");
const origin = "https://malkomebel.ru";
const delayMs = Number(process.env.CRAWL_DELAY_MS || 1200);
const assetDelayMs = Number(process.env.ASSET_DELAY_MS || 180);
const maxPages = Number(process.env.MAX_PAGES || 1600);
const userAgent = "NVRDevelopment-PublicSiteArchive/1.0";

const disallowedPrefixes = [
  "/admin/",
  "/comment/reply/",
  "/filter/tips/",
  "/node/add/",
  "/search/",
  "/user/",
  "/media-gallery/detail/",
  "/custom/more-media/",
  "/not-found",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function cleanText(value = "") {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function safeSegment(value) {
  return decodeURIComponent(value || "")
    .replace(/[<>:"\\|?*\u0000-\u001f]/g, "_")
    .replace(/^\.+$/, "_") || "_";
}

function pageFilePath(urlString) {
  const url = new URL(urlString);
  const segments = url.pathname.split("/").filter(Boolean).map(safeSegment);
  return path.join(pagesDir, ...segments, "index.html");
}

function assetFilePath(urlString) {
  const url = new URL(urlString);
  const segments = url.pathname.split("/").filter(Boolean).map(safeSegment);
  let target = path.join(assetsDir, ...segments);
  if (url.pathname.endsWith("/") || !path.extname(target)) {
    const digest = createHash("sha1").update(urlString).digest("hex").slice(0, 10);
    target = path.join(target, `asset-${digest}`);
  }
  return target;
}

function normalizeUrl(raw, base = origin) {
  if (!raw || raw.startsWith("data:") || raw.startsWith("javascript:") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return null;
  try {
    const url = new URL(raw.trim(), base);
    if (url.origin !== origin) return null;
    url.hash = "";
    ["etext", "yhid", "from", "fbclid", "stat-id", "test-tag", "format-type", "actual-format", "banner-test-tags", "target-ref", "yadclid", "yadordid"].forEach((key) => url.searchParams.delete(key));
    if ([...url.searchParams.keys()].length === 0) url.search = "";
    return url.href;
  } catch {
    return null;
  }
}

function isAllowedPage(urlString) {
  try {
    const { pathname } = new URL(urlString);
    return !disallowedPrefixes.some((prefix) => pathname.startsWith(prefix)) && !pathname.includes("/done") && !pathname.includes("/submission");
  } catch {
    return false;
  }
}

function addSrcset(value, base, bucket) {
  for (const candidate of (value || "").split(",")) {
    const raw = candidate.trim().split(/\s+/)[0];
    const normalized = normalizeUrl(raw, base);
    if (normalized) bucket.add(normalized);
  }
}

function extractPage(html, pageUrl, assetUrls, discoveredPages) {
  const $ = cheerio.load(html);
  $("script, style, noscript, template").remove();

  $("a[href]").each((_, element) => {
    const normalized = normalizeUrl($(element).attr("href"), pageUrl);
    if (normalized && isAllowedPage(normalized)) discoveredPages.add(normalized);
  });

  const directAssetAttrs = [
    ["img[src]", "src"], ["img[data-src]", "data-src"], ["source[src]", "src"],
    ["script[src]", "src"], ["video[src]", "src"], ["video[poster]", "poster"],
    ["audio[src]", "src"], ["link[href]", "href"],
  ];
  for (const [selector, attribute] of directAssetAttrs) {
    $(selector).each((_, element) => {
      const normalized = normalizeUrl($(element).attr(attribute), pageUrl);
      if (normalized) assetUrls.add(normalized);
    });
  }
  $("img[srcset], source[srcset]").each((_, element) => addSrcset($(element).attr("srcset"), pageUrl, assetUrls));

  const bodyClone = $("body").clone();
  bodyClone.find("script, style, noscript, template, svg").remove();

  return {
    url: pageUrl,
    title: cleanText($("title").first().text()),
    description: cleanText($("meta[name='description']").attr("content") || ""),
    canonical: normalizeUrl($("link[rel='canonical']").attr("href"), pageUrl),
    h1: $("h1").map((_, el) => cleanText($(el).text())).get().filter(Boolean),
    headings: $("h2, h3").map((_, el) => cleanText($(el).text())).get().filter(Boolean),
    paragraphs: bodyClone.find("p").map((_, el) => cleanText($(el).text())).get().filter(Boolean),
    listItems: bodyClone.find("li").map((_, el) => cleanText($(el).text())).get().filter(Boolean),
    images: $("img").map((_, el) => ({
      src: normalizeUrl($(el).attr("src") || $(el).attr("data-src"), pageUrl),
      alt: cleanText($(el).attr("alt") || ""),
      title: cleanText($(el).attr("title") || ""),
    })).get().filter((item) => item.src),
  };
}

async function fetchWithRetry(url, kind) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": userAgent, accept: kind === "page" ? "text/html,application/xhtml+xml" : "*/*" },
      });
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      lastError = error;
      await sleep(500 * attempt);
    }
  }
  throw lastError;
}

async function main() {
  await Promise.all([mkdir(pagesDir, { recursive: true }), mkdir(assetsDir, { recursive: true }), mkdir(reportsDir, { recursive: true })]);
  const sitemap = await readFile(sitemapPath, "utf8");
  const initialUrls = [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/g)]
    .map((match) => cleanText(match[1]).replace(/^h\s+ttps:/i, "https:"))
    .map((value) => normalizeUrl(value))
    .filter((value) => value && isAllowedPage(value));

  const queue = [...new Set([origin + "/", ...initialUrls])];
  const queued = new Set(queue);
  const visited = new Set();
  const assetUrls = new Set();
  const pages = [];
  const failures = [];

  for (let index = 0; index < queue.length && visited.size < maxPages; index += 1) {
    const pageUrl = queue[index];
    if (visited.has(pageUrl)) continue;
    visited.add(pageUrl);
    try {
      const response = await fetchWithRetry(pageUrl, "page");
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) continue;
      const html = await response.text();
      const filePath = pageFilePath(pageUrl);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, html, "utf8");
      const discovered = new Set();
      const record = extractPage(html, pageUrl, assetUrls, discovered);
      record.file = path.relative(archiveDir, filePath).replaceAll("\\", "/");
      pages.push(record);
      for (const discoveredUrl of discovered) {
        if (!queued.has(discoveredUrl) && queue.length < maxPages) {
          queued.add(discoveredUrl);
          queue.push(discoveredUrl);
        }
      }
    } catch (error) {
      failures.push({ url: pageUrl, kind: "page", error: String(error?.message || error) });
    }
    if (visited.size % 25 === 0) console.log(`pages ${visited.size}/${queue.length}; assets discovered ${assetUrls.size}; failures ${failures.length}`);
    await sleep(delayMs);
  }

  const assetQueue = [...assetUrls];
  const downloadedAssets = [];
  for (let index = 0; index < assetQueue.length; index += 1) {
    const assetUrl = assetQueue[index];
    try {
      const response = await fetchWithRetry(assetUrl, "asset");
      const buffer = Buffer.from(await response.arrayBuffer());
      const filePath = assetFilePath(assetUrl);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, buffer);
      downloadedAssets.push({
        url: assetUrl,
        file: path.relative(archiveDir, filePath).replaceAll("\\", "/"),
        bytes: buffer.length,
        contentType: response.headers.get("content-type") || "",
      });
      if ((response.headers.get("content-type") || "").includes("text/css")) {
        const css = buffer.toString("utf8");
        for (const match of css.matchAll(/url\((['"]?)(.*?)\1\)/g)) {
          const nested = normalizeUrl(match[2], assetUrl);
          if (nested && !assetUrls.has(nested)) {
            assetUrls.add(nested);
            assetQueue.push(nested);
          }
        }
      }
    } catch (error) {
      failures.push({ url: assetUrl, kind: "asset", error: String(error?.message || error) });
    }
    if ((index + 1) % 100 === 0) console.log(`assets ${index + 1}/${assetQueue.length}; failures ${failures.length}`);
    await sleep(assetDelayMs);
  }

  const summary = {
    createdAt: new Date().toISOString(),
    source: origin,
    publicPagesSaved: pages.length,
    assetsSaved: downloadedAssets.length,
    failures: failures.length,
    notes: ["Archive contains only publicly accessible same-origin content.", "Robots-disallowed paths were excluded."],
  };
  await writeFile(path.join(reportsDir, "pages.json"), JSON.stringify(pages, null, 2), "utf8");
  await writeFile(path.join(reportsDir, "assets.json"), JSON.stringify(downloadedAssets, null, 2), "utf8");
  await writeFile(path.join(reportsDir, "failures.json"), JSON.stringify(failures, null, 2), "utf8");
  await writeFile(path.join(reportsDir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
  console.log(JSON.stringify(summary));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
