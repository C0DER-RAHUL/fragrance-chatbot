import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const text = fs.readFileSync("./knowledge/website.txt", "utf8");

function splitText(text, size = 500) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

async function createEmbeddings() {

  const chunks = splitText(text);

  const embeddings = [];

  for (const chunk of chunks) {

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunk
    });

    embeddings.push({
      text: chunk,
      embedding: response.data[0].embedding
    });

  }

  fs.writeFileSync("./knowledge/embeddings.json", JSON.stringify(embeddings));

  console.log("Embeddings created successfully.");
}

createEmbeddings();