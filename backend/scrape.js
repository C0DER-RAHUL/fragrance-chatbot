import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const baseUrl = "https://www.adirondackfragrance.com";

const visited = new Set();
const pagesToVisit = [baseUrl];

let collectedText = "";

async function scrapePage(url) {

  if (visited.has(url)) return;
  visited.add(url);

  try {

    console.log("Scraping:", url);

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    // Extract page text
    $("p, h1, h2, h3, h4, li, span").each((i, el) => {
      collectedText += $(el).text().trim() + "\n";
    });

    // Collect internal links
    $("a").each((i, el) => {

      const link = $(el).attr("href");

      if (!link) return;

      if (link.startsWith("/") && !visited.has(baseUrl + link)) {
        pagesToVisit.push(baseUrl + link);
      }

    });

  } catch (error) {

    console.log("Failed:", url);

  }
}

async function crawlSite() {

  while (pagesToVisit.length > 0 && visited.size < 20) {

    const nextUrl = pagesToVisit.shift();

    await scrapePage(nextUrl);

  }

  fs.writeFileSync("./knowledge/website.txt", collectedText);

  console.log("Website crawl complete.");
}

crawlSite();