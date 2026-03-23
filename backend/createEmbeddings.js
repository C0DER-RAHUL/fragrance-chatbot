import fs from "fs";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


/* ===============================
   Load Crawled Website Data
================================ */

const pages = JSON.parse(
  fs.readFileSync("./knowledge/websiteData.json", "utf8")
);


/* ===============================
   Split Text into Chunks
================================ */

function chunkText(text, size = 1500) {

  const chunks = [];

  for (let i = 0; i < text.length; i += size) {

    const chunk = text.slice(i, i + size).trim();

    if (chunk.length > 120) {
      chunks.push(chunk);
    }

  }

  return chunks;
}


/* ===============================
   Create Embeddings
================================ */

async function createEmbeddings() {

  const allChunks = [];

  pages.forEach((page) => {

    const chunks = chunkText(page.text);

    allChunks.push(...chunks);

  });

  console.log("Total chunks:", allChunks.length);

  const batchSize = 100;
  const embeddings = [];

  for (let i = 0; i < allChunks.length; i += batchSize) {

    const batch = allChunks.slice(i, i + batchSize);

    const batchNumber = Math.floor(i / batchSize) + 1;

    console.log(`Embedding batch ${batchNumber}`);

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch
    });

    response.data.forEach((item, index) => {

      embeddings.push({
        text: batch[index],
        embedding: item.embedding
      });

    });

  }


  /* Save embeddings */

  fs.writeFileSync(
    "./knowledge/embeddings.json",
    JSON.stringify(embeddings, null, 2)
  );

  console.log("Embeddings created:", embeddings.length);

}


createEmbeddings();