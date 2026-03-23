import OpenAI from "openai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const products = JSON.parse(
  fs.readFileSync("./knowledge/products.json", "utf8")
);

async function embedProducts() {

  const embeddedProducts = [];

  for (const product of products) {

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: product.name
    });

    embeddedProducts.push({
      ...product,
      embedding: response.data[0].embedding
    });

  }

  fs.writeFileSync(
    "./knowledge/productEmbeddings.json",
    JSON.stringify(embeddedProducts, null, 2)
  );

  console.log("Product embeddings created:", embeddedProducts.length);
}

embedProducts();