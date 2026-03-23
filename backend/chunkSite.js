import fs from "fs"

const pages = JSON.parse(
  fs.readFileSync("./knowledge/siteData.json", "utf8")
)

const chunks = []

function chunkText(text, size = 500) {

  for (let i = 0; i < text.length; i += size) {

    const chunk = text.slice(i, i + size).trim()

    if (chunk.length > 80) {
      chunks.push(chunk)
    }

  }

}

pages.forEach(page => {
  chunkText(page.text)
})

fs.writeFileSync(
  "./knowledge/chunks.json",
  JSON.stringify(chunks, null, 2)
)

console.log("Chunks created:", chunks.length)