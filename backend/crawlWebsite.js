import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const BASE_URL = "https://www.adirondackfragrance.com";

const visited = new Set();
const queue = [BASE_URL];

const pages = [];

function normalizeUrl(url) {

  if (!url) return null;

  if (url.startsWith("/")) {
    url = BASE_URL + url;
  }

  if (!url.startsWith(BASE_URL)) {
    return null;
  }

  // remove anchors
  url = url.split("#")[0];

  // avoid pagination duplicates
  if (url.includes("?page=")) return null;

  return url;

}

async function crawl() {

  while (queue.length > 0) {

    const url = queue.shift();

    if (visited.has(url)) continue;

    visited.add(url);

    try {

      console.log("Crawling:", url);

      const response = await axios.get(url);

      const html = response.data;

      const $ = cheerio.load(html);

      const text = $("body")
        .text()
        .replace(/\s+/g, " ")
        .trim();

      pages.push({
        url,
        text
      });

      $("a").each((i, el) => {

        const href = $(el).attr("href");

        const normalized = normalizeUrl(href);

        if (!normalized) return;

        if (!visited.has(normalized)) {
          queue.push(normalized);
        }

      });

    } catch (err) {

      console.log("Skipped:", url);

    }

  }

}

async function start() {

  await crawl();

  fs.writeFileSync(
    "./knowledge/websiteData.json",
    JSON.stringify(pages, null, 2)
  );

  console.log("Total pages scraped:", pages.length);

}

start();