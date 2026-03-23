import axios from "axios";
import fs from "fs";

const url = "https://www.adirondackfragrance.com/products.json?limit=250";

async function scrapeProducts() {

  try {

    const response = await axios.get(url);

    const products = response.data.products.map(product => ({

      name: product.title,

      url: "https://www.adirondackfragrance.com/products/" + product.handle,

      image:
        product.images.length > 0
          ? product.images[0].src
          : "",

      price:
        product.variants.length > 0
          ? product.variants[0].price
          : ""

    }));

    fs.writeFileSync(
      "./knowledge/products.json",
      JSON.stringify(products, null, 2)
    );

    console.log("Products saved:", products.length);

  } catch (error) {

    console.error("Scraping failed:", error.message);

  }

}

scrapeProducts();