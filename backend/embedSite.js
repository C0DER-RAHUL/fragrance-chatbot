import OpenAI from "openai"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()

const openai = new OpenAI({
apiKey:process.env.OPENAI_API_KEY
})

const chunks = JSON.parse(
fs.readFileSync("./knowledge/chunks.json","utf8")
)

async function run(){

const vectors=[]

for(const chunk of chunks){

const res = await openai.embeddings.create({
model:"text-embedding-3-small",
input:chunk.text
})

vectors.push({
url:chunk.url,
text:chunk.text,
embedding:res.data[0].embedding
})

}

fs.writeFileSync(
"./knowledge/embeddings.json",
JSON.stringify(vectors,null,2)
)

console.log("Embeddings created:",vectors.length)

}

run()