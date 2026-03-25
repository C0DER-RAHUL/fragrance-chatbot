// import express from "express"
// import cors from "cors"
// import dotenv from "dotenv"
// import OpenAI from "openai"
// import fs from "fs"
// import similarity from "compute-cosine-similarity"

// dotenv.config()

// const app = express()
// app.use(cors())
// app.use(express.json())

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// })

// /* =============================
//    ANALYTICS STORAGE
// ============================= */

// const analytics = {
//   conversations: [],
//   questions: {},
//   productClicks: {},
//   failedQuestions: [],
//   activeHours: {},
//   leads: [],
//   events: []
// }

// /* =============================
//    USER PROFILES
// ============================= */

// const users = {}

// function getUserProfile(userId){

//   if(!users[userId]){
//     users[userId] = {
//       userId,
//       email:null,
//       firstSeen:new Date(),
//       lastSeen:new Date(),
//       questions:0,
//       conversations:0,
//       productClicks:[],
//       interests:[]
//     }
//   }

//   users[userId].lastSeen = new Date()
//   return users[userId]
// }

// /* =============================
//    LOAD KNOWLEDGE
// ============================= */

// const websiteEmbeddings = JSON.parse(
//   fs.readFileSync("./knowledge/embeddings.json","utf8")
// )

// const productEmbeddings = JSON.parse(
//   fs.readFileSync("./knowledge/productEmbeddings.json","utf8")
// )

// /* =============================
//    SESSION STORAGE
// ============================= */

// const sessions = {}

// const DAY = 24 * 60 * 60 * 1000
// const MAX_HISTORY = 12

// function getSession(userId){

//   const now = Date.now()

//   if(!sessions[userId]){
//     sessions[userId] = {
//       messages: [],
//       created: now
//     }
//   }

//   /* CLEAR SESSION AFTER 24 HOURS */

//   if(now - sessions[userId].created > DAY){
//     sessions[userId] = {
//       messages: [],
//       created: now
//     }
//   }

//   return sessions[userId].messages
// }

// /* =============================
//    BUDGET DETECTION
// ============================= */

// function extractBudget(message){

//   const match =
//     message.match(/\$?(\d+)\s?(dollar|usd)?/i)

//   if(match){
//     return parseInt(match[1])
//   }

//   return null
// }

// /* =============================
//    INTEREST DETECTION
// ============================= */

// function detectInterest(message){

//   const text = message.toLowerCase()
//   const interests = []

//   if(text.includes("woody")) interests.push("woody")
//   if(text.includes("fresh")) interests.push("fresh")
//   if(text.includes("winter")) interests.push("winter")
//   if(text.includes("gift")) interests.push("gift")
//   if(text.includes("forest")) interests.push("forest")

//   return interests
// }

// /* =============================
//    WEBSITE SEARCH
// ============================= */

// async function findRelevantContext(question){

//   const embeddingResponse =
//     await openai.embeddings.create({
//       model:"text-embedding-3-small",
//       input:question
//     })

//   const questionEmbedding =
//     embeddingResponse.data[0].embedding

//   const scores =
//     websiteEmbeddings.map(chunk=>({
//       text:chunk.text,
//       score: similarity(
//         questionEmbedding,
//         chunk.embedding
//       )
//     }))

//   scores.sort((a,b)=>b.score-a.score)

//   return scores.slice(0,3)
// }

// /* =============================
//    PRODUCT SEARCH
// ============================= */

// async function findRelevantProducts(question){

//   const budget = extractBudget(question)

//   const embeddingResponse =
//     await openai.embeddings.create({
//       model:"text-embedding-3-small",
//       input:question
//     })

//   const questionEmbedding =
//     embeddingResponse.data[0].embedding

//   let products = productEmbeddings

//   if(budget){

//     products = products.filter(p=>{

//       const price =
//         parseFloat(
//           String(p.price).replace("$","")
//         )

//       return price <= budget
//     })
//   }

//   const scores =
//     products.map(product=>({

//       product,

//       score: similarity(
//         questionEmbedding,
//         product.embedding
//       )

//     }))

//   scores.sort((a,b)=>b.score-a.score)

//   return scores.slice(0,4).map(p=>({

//     name:p.product.name,
//     image:p.product.image,
//     price:p.product.price,
//     url:p.product.url,
//     score:p.score

//   }))
// }

// /* =============================
//    RETURNING USER PRODUCTS
// ============================= */

// function recommendForReturningUser(user){

//   if(!user.productClicks.length){
//     return []
//   }

//   const lastProductName =
//     user.productClicks[user.productClicks.length-1]

//   const lastProduct =
//     productEmbeddings.find(p=>p.name === lastProductName)

//   if(!lastProduct){
//     return []
//   }

//   const similar =
//     productEmbeddings
//       .filter(p=>p.name !== lastProduct.name)
//       .map(p=>({
//         product:p,
//         score: similarity(lastProduct.embedding, p.embedding)
//       }))
//       .sort((a,b)=>b.score-a.score)
//       .slice(0,3)
//       .map(({product})=>({
//         name:product.name,
//         image:product.image,
//         price:product.price,
//         url:product.url
//       }))

//   return similar
// }

// /* =============================
//    CHAT API
// ============================= */

// app.post("/chat", async(req,res)=>{

//   const userMessage = req.body.message
//   const userId = req.body.userId || "guest"

//   try{

//     const user = getUserProfile(userId)
//     const sessionHistory = getSession(userId)

//     user.questions++
//     user.conversations++

//     const hour = new Date().getHours()

//     analytics.activeHours[hour] =
//       (analytics.activeHours[hour] || 0) + 1

//     const interests = detectInterest(userMessage)

//     interests.forEach(i=>{
//       if(!user.interests.includes(i)){
//         user.interests.push(i)
//       }
//     })

//     sessionHistory.push({
//       role:"user",
//       content:userMessage
//     })

//     /* LIMIT CHAT HISTORY */

//     if(sessionHistory.length > MAX_HISTORY){
//       sessionHistory.splice(0, sessionHistory.length - MAX_HISTORY)
//     }

//     /* CONTEXT SEARCH */

//     const contextChunks =
//       await findRelevantContext(userMessage)

//     const contextScore =
//       contextChunks[0]?.score || 0

//     const context =
//       contextChunks.map(c=>c.text).join("\n")

//     if(contextScore < 0.15){

//       analytics.failedQuestions.push(userMessage)

//       return res.json({
//         reply:"I couldn't find that information on the Adirondack Fragrance website.",
//         products:[]
//       })
//     }

//     /* PRODUCT SEARCH */

//     const candidateProducts =
//       await findRelevantProducts(userMessage)

//     const bestScore =
//       candidateProducts[0]?.score ?? 0

//     let recommendedProducts = []

//     if(bestScore > 0.22){
//       recommendedProducts = candidateProducts
//     }

//     if(!recommendedProducts.length){

//       const returning =
//         recommendForReturningUser(user)

//       if(returning.length){
//         recommendedProducts = returning
//       }
//     }

//     const productContext =
//       recommendedProducts
//         .map(p=>`
// ${p.name}
// Price: ${p.price}
// Link: ${p.url}`)
//         .join("\n")

//     /* OPENAI RESPONSE */

//    const completion =
//       await openai.chat.completions.create({

//         model:"gpt-4o-mini",

//         messages:[
//           {
//             role:"system",
//             content:`You are a professional AI shopping assistant for Adirondack Fragrance.

// Your goal is to help customers discover fragrances and products that match their needs while providing a friendly and professional shopping experience.
// STRICT PRODUCT RULES:

// 1. Only recommend products listed in "Products Available".
// 2. Never invent product names.
// 3. Never guess product links or prices.
// 4. If no products are available, ask the user for more details.


// Customer Understanding
// - Carefully understand what the customer is asking.
// - Focus on the customer's intent before answering.
// - If the request is unclear, ask a short clarifying question.
// - Always answer directly according to what the customer is requesting.

// Product Recommendations
// - Recommend products that best match the customer's request.
// - Prioritize the most relevant product first.
// - Mention the product name clearly and naturally.
// - If multiple products match, recommend up to 3 products.
// - Only recommend products from the provided product list.
// - Never invent products.

// Budget Awareness
// - If the customer mentions a price or budget limit, only recommend products within that range.

// Providing Links
// - If the customer asks for a product link, include the direct product URL.
// - Never say you cannot provide links.

// Sales Assistance
// - Highlight product benefits such as scent notes, ingredients, or use cases.
// - If a customer asks for a gift, suggest gift items or bundles.
// - If a customer shows interest in a product, you may suggest complementary items.

// Conversation Style
// - Be friendly, professional, and concise.
// - Write like a helpful store associate in a boutique fragrance shop.
// - Avoid robotic or technical language.

// Accuracy
// - Only use the website knowledge and provided product list.
// - If unsure, politely say you do not know rather than guessing.

// Website Knowledge:
// ${context}

// Products Available:
// ${productContext}`
//           },
//           ...sessionHistory
//         ]

//       })

//     let reply =
//       completion.choices[0].message.content

//     const wantsLink =
//       /\blink\b|\burl\b|\bdirect link\b/i
//         .test(userMessage)

//     if(wantsLink && recommendedProducts[0]?.url){

//       reply += `\n\nProduct Link:\n${recommendedProducts[0].url}`
//     }

//     sessionHistory.push({
//       role:"assistant",
//       content:reply
//     })

//     /* LIMIT HISTORY AGAIN */

//     if(sessionHistory.length > MAX_HISTORY){
//       sessionHistory.splice(0, sessionHistory.length - MAX_HISTORY)
//     }

//     res.json({
//       reply,
//       products:recommendedProducts.map(p=>({
//         name:p.name,
//         image:p.image,
//         price:p.price,
//         url:p.url
//       }))
//     })

//   }
//   catch(err){

//     console.error(err)

//     res.status(500).json({
//       reply:"Something went wrong."
//     })

//   }

// })

// /* =============================
//    PRODUCT CLICK TRACKING
// ============================= */

// app.post("/product-click",(req,res)=>{

//   const {product,userId} = req.body

//   if(!analytics.productClicks[product]){
//     analytics.productClicks[product] = 0
//   }

//   analytics.productClicks[product]++

//   const user = getUserProfile(userId)

//   user.productClicks.push(product)

//   analytics.events.push({
//     type:"product_click",
//     product,
//     userId,
//     time:new Date()
//   })

//   res.json({status:"ok"})
// })

// /* =============================
//    LEAD CAPTURE
// ============================= */

// app.post("/lead",(req,res)=>{

//   const {email,userId} = req.body

//   const user = getUserProfile(userId)

//   user.email = email

//   analytics.leads.push({
//     email,
//     userId,
//     interests:user.interests,
//     products:user.productClicks,
//     time:new Date()
//   })

//   res.json({status:"saved"})
// })

// /* =============================
//    DASHBOARD APIS
// ============================= */

// app.get("/dashboard/stats",(req,res)=>{

//   const totalClicks =
//     Object.values(analytics.productClicks)
//       .reduce((a,b)=>a+b,0)

//   res.json({

//     conversations:
//       analytics.conversations.length,

//     questions:
//       Object.values(analytics.questions)
//         .reduce((a,b)=>a+b,0),

//     uniqueUsers:
//       Object.keys(users).length,

//     productClicks: totalClicks,

//     conversionRate:
//       analytics.conversations.length
//         ? (totalClicks / analytics.conversations.length)
//         : 0
//   })
// })

// app.get("/dashboard/leads",(req,res)=>{

//   const leads =
//     analytics.leads
//       .slice(-50)
//       .reverse()

//   res.json(leads)
// })

// app.listen(5000,()=>{
//   console.log("Server running on port 5000")
// })



























import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import OpenAI from "openai"
import fs from "fs"
import similarity from "compute-cosine-similarity"
import path from 'path'; // <--- Make sure this line exists!

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/* =============================
   ANALYTICS STORAGE
============================= */

const analytics = {
  conversations: [],
  questions: {},
  productClicks: {},
  failedQuestions: [],
  activeHours: {},
  leads: [],
  events: []
}

/* =============================
   USER PROFILES
============================= */

const users = {}

function getUserProfile(userId){

  if(!users[userId]){
    users[userId] = {
      userId,
      email:null,
      firstSeen:new Date(),
      lastSeen:new Date(),
      questions:0,
      conversations:0,
      productClicks:[],
      interests:[]
    }
  }

  users[userId].lastSeen = new Date()
  return users[userId]
}

/* =============================
   LOAD KNOWLEDGE
============================= */

  /* ====================================
    LOAD KNOWLEDGE
==================================== */

// Helper to safely load JSON without crashing the server
const safeLoadJSON = (filePath, fallbackValue = []) => {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, "utf8"));
        } else {
            console.warn(`⚠️ Warning: ${filePath} not found. Using empty data.`);
            return fallbackValue;
        }
    } catch (error) {
        console.error(`❌ Error reading ${filePath}:`, error);
        return fallbackValue;
    }
};

const websiteEmbeddingsPath = path.join(process.cwd(), "knowledge", "embeddings.json");
const productEmbeddingsPath = path.join(process.cwd(), "knowledge", "productEmbeddings.json");

console.log("🔍 Looking for embeddings at:", websiteEmbeddingsPath);

const websiteEmbeddings = safeLoadJSON(websiteEmbeddingsPath);
const productEmbeddings = safeLoadJSON(productEmbeddingsPath);

/* ====================================
    SESSION STORAGE
==================================== */

/* =============================
   SESSION STORAGE
============================= */

const sessions = {}

const DAY = 24 * 60 * 60 * 1000
const MAX_HISTORY = 12

function getSession(userId){

  const now = Date.now()

  if(!sessions[userId]){
    sessions[userId] = {
      messages: [],
      created: now
    }
  }

  if(now - sessions[userId].created > DAY){
    sessions[userId] = {
      messages: [],
      created: now
    }
  }

  return sessions[userId].messages
}

/* =============================
   CLEAR SESSION FUNCTION
============================= */

function clearSession(userId){
  sessions[userId] = {
    messages: [],
    created: Date.now()
  }
}

/* =============================
   BUDGET DETECTION
============================= */

function extractBudget(message){

  const match =
    message.match(/\$?(\d+)\s?(dollar|usd)?/i)

  if(match){
    return parseInt(match[1])
  }

  return null
}

/* =============================
   INTEREST DETECTION
============================= */

function detectInterest(message){

  const text = message.toLowerCase()
  const interests = []

  if(text.includes("woody")) interests.push("woody")
  if(text.includes("fresh")) interests.push("fresh")
  if(text.includes("winter")) interests.push("winter")
  if(text.includes("gift")) interests.push("gift")
  if(text.includes("forest")) interests.push("forest")

  return interests
}

/* =============================
   WEBSITE SEARCH
============================= */

async function findRelevantContext(question){

  const embeddingResponse =
    await openai.embeddings.create({
      model:"text-embedding-3-small",
      input:question
    })

  const questionEmbedding =
    embeddingResponse.data[0].embedding

  const scores =
    websiteEmbeddings.map(chunk=>({
      text:chunk.text,
      score: similarity(
        questionEmbedding,
        chunk.embedding
      )
    }))

  scores.sort((a,b)=>b.score-a.score)

  return scores.slice(0,3)
}

/* =============================
   PRODUCT SEARCH
============================= */

async function findRelevantProducts(question){

  const budget = extractBudget(question)

  const embeddingResponse =
    await openai.embeddings.create({
      model:"text-embedding-3-small",
      input:question
    })

  const questionEmbedding =
    embeddingResponse.data[0].embedding

  let products = productEmbeddings

  if(budget){

    products = products.filter(p=>{

      const price =
        parseFloat(String(p.price).replace("$",""))

      return price <= budget
    })
  }

  const scores =
    products.map(product=>({

      product,

      score: similarity(
        questionEmbedding,
        product.embedding
      )

    }))

  scores.sort((a,b)=>b.score-a.score)

  return scores.slice(0,4).map(p=>({

    name:p.product.name,
    image:p.product.image,
    price:p.product.price,
    url:p.product.url,
    score:p.score

  }))
}

/* =============================
   RETURNING USER PRODUCTS
============================= */

function recommendForReturningUser(user){

  if(!user.productClicks.length){
    return []
  }

  const lastProductName =
    user.productClicks[user.productClicks.length-1]

  const lastProduct =
    productEmbeddings.find(p=>p.name === lastProductName)

  if(!lastProduct){
    return []
  }

  const similar =
    productEmbeddings
      .filter(p=>p.name !== lastProduct.name)
      .map(p=>({
        product:p,
        score: similarity(lastProduct.embedding, p.embedding)
      }))
      .sort((a,b)=>b.score-a.score)
      .slice(0,3)
      .map(({product})=>({
        name:product.name,
        image:product.image,
        price:product.price,
        url:product.url
      }))

  return similar
}

/* =============================
   CHAT API
============================= */

app.post("/chat", async(req,res)=>{

  const userMessage = req.body.message
  const userId = req.body.userId || "guest"
  const reset = req.body.reset || false

  try{

    if(reset){
      clearSession(userId)
    }

    const user = getUserProfile(userId)
    const sessionHistory = getSession(userId)

    user.questions++
    user.conversations++

    const interests = detectInterest(userMessage)

    interests.forEach(i=>{
      if(!user.interests.includes(i)){
        user.interests.push(i)
      }
    })

    sessionHistory.push({
      role:"user",
      content:userMessage
    })

    if(sessionHistory.length > MAX_HISTORY){
      sessionHistory.splice(0, sessionHistory.length - MAX_HISTORY)
    }

    const contextChunks =
      await findRelevantContext(userMessage)

    const contextScore =
      contextChunks[0]?.score || 0

    const context =
      contextChunks.map(c=>c.text).join("\n")

    // Change 0.15 to 0.05 so it's less strict
    if(contextScore < 0.05){
      // Instead of stopping the code, we just log it and let the AI try anyway
      console.log("Low context score for message:", userMessage);
    }

    const candidateProducts =
      await findRelevantProducts(userMessage)

    let recommendedProducts = []

    if(candidateProducts[0]?.score > 0.22){
      recommendedProducts = candidateProducts
    }

    if(!recommendedProducts.length){
      const returning =
        recommendForReturningUser(user)

      if(returning.length){
        recommendedProducts = returning
      }
    }

    const productContext =
      recommendedProducts.map(p=>`
${p.name}
Price: ${p.price}
Link: ${p.url}`).join("\n")

    const completion =
      await openai.chat.completions.create({

        model:"gpt-4o-mini",
        temperature:0.2,

        messages:[
          {
            role:"system",
            content:`You are a professional AI shopping assistant for Adirondack Fragrance.

Your goal is to help customers discover fragrances and products that match their needs while providing a friendly and professional shopping experience.
STRICT PRODUCT RULES:

1. Only recommend products listed in "Products Available".
2. Never invent product names.
3. Never guess product links or prices.
4. If no products are available, ask the user for more details.


Customer Understanding
- Carefully understand what the customer is asking.
- Focus on the customer's intent before answering.
- If the request is unclear, ask a short clarifying question.
- Always answer directly according to what the customer is requesting.

Product Recommendations
- Recommend products that best match the customer's request.
- Prioritize the most relevant product first.
- Mention the product name clearly and naturally.
- If multiple products match, recommend up to 3 products.
- Only recommend products from the provided product list.
- Never invent products.

Budget Awareness
- If the customer mentions a price or budget limit, only recommend products within that range.

Providing Links
- If the customer asks for a product link, include the direct product URL.
- Never say you cannot provide links.

Sales Assistance
- Highlight product benefits such as scent notes, ingredients, or use cases.
- If a customer asks for a gift, suggest gift items or bundles.
- If a customer shows interest in a product, you may suggest complementary items.

Conversation Style
- Be friendly, professional, and concise.
- Write like a helpful store associate in a boutique fragrance shop.
- Avoid robotic or technical language.
- Use emojis occasionally to be warm and friendly.

Accuracy
- Only use the website knowledge and provided product list.
- If unsure, politely say you do not know rather than guessing.

Suggested Follow-Up Questions
- At the very end of EVERY response, you MUST include exactly one line starting with "SUGGESTED:" followed by 2-3 short follow-up questions the customer might want to ask next, separated by | character.
- Example: SUGGESTED: What scents do you have for summer? | Do you offer gift sets? | What's your return policy?
- The suggested questions should be relevant to the conversation context and feel natural.
- Keep each question short (under 10 words).
- This SUGGESTED line must always be the very last line of your response.

Website Knowledge:
${context}

Products Available:
${productContext}`
          },
          ...sessionHistory
        ]

      })

    let reply =
      completion.choices[0].message.content

    // Parse suggested questions from the response
    let suggestedQuestions = []
    const suggestedMatch = reply.match(/SUGGESTED:\s*(.+)$/im)
    if(suggestedMatch){
      suggestedQuestions = suggestedMatch[1]
        .split("|")
        .map(q => q.trim())
        .filter(q => q.length > 0)
      // Remove the SUGGESTED line from the reply
      reply = reply.replace(/\n?SUGGESTED:\s*(.+)$/im, "").trim()
    }

    sessionHistory.push({
      role:"assistant",
      content:reply
    })

    res.json({
      reply,
      suggestedQuestions,
      products:recommendedProducts.map(p=>({
        name:p.name,
        image:p.image,
        price:p.price,
        url:p.url
      }))
    })

  }
  catch(err){

    console.error(err)

    res.status(500).json({
      reply:"Something went wrong."
    })

  }

})

/* =============================
   CLEAR CHAT API
============================= */

app.post("/clear-chat",(req,res)=>{

  const {userId} = req.body

  clearSession(userId)

  res.json({
    status:"chat_cleared"
  })
})

/* =============================
   DASHBOARD APIS
============================= */

app.get("/dashboard/stats",(req,res)=>{

  const totalClicks =
    Object.values(analytics.productClicks)
      .reduce((a,b)=>a+b,0)

  res.json({
    conversations: analytics.conversations.length,
    questions: Object.values(analytics.questions).reduce((a,b)=>a+b,0),
    uniqueUsers: Object.keys(users).length,
    productClicks: totalClicks,
    conversionRate:
      analytics.conversations.length
        ? (totalClicks / analytics.conversations.length)
        : 0
  })
})

app.listen(5000,()=>{
  console.log("Server running on port 5000")
})
