import fs from "fs"
import OpenAI from "openai"
import dotenv from "dotenv"

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function generate(){

  const supportData = JSON.parse(
    fs.readFileSync("./knowledge/supportInfo.json","utf8")
  )

  const existingEmbeddings = JSON.parse(
    fs.readFileSync("./knowledge/embeddings.json","utf8")
  )

  const newEmbeddings = []

  for(const item of supportData){

    const res = await openai.embeddings.create({
      model:"text-embedding-3-small",
      input:item.text
    })

    newEmbeddings.push({
      text:item.text,
      embedding:res.data[0].embedding
    })

    console.log("Embedded:", item.text)
  }

  const merged = [...existingEmbeddings, ...newEmbeddings]

  fs.writeFileSync(
    "./knowledge/embeddings.json",
    JSON.stringify(merged,null,2)
  )

  console.log("✅ Support information added to embeddings")
}

generate()