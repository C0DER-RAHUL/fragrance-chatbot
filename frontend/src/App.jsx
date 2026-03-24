// import { useState, useEffect, useRef } from "react";
// import ReactMarkdown from "react-markdown";

// function App() {

//   const userId =
//     localStorage.getItem("chatUserId") ||
//     crypto.randomUUID();

//   localStorage.setItem("chatUserId", userId);


//   /* Load chat history */

//   const [messages, setMessages] = useState(() => {

//     const saved =
//       localStorage.getItem("chatHistory");

//     return saved
//       ? JSON.parse(saved)
//       : [{ sender:"bot", text:"Hello! How can I assist you today?" }];

//   });


//   const [input, setInput] = useState("");
//   const [open, setOpen] = useState(false);
//   const [typing, setTyping] = useState(false);

//   const messagesEndRef = useRef(null);


//   /* Save chat history */

//   useEffect(()=>{

//     localStorage.setItem(
//       "chatHistory",
//       JSON.stringify(messages)
//     )

//   },[messages])


//   /* Auto scroll */

//   useEffect(()=>{

//     messagesEndRef.current?.scrollIntoView({
//       behavior:"smooth"
//     })

//   },[messages,typing])


//   /* Send message */

//   const sendMessage = async()=>{

//     if(!input.trim()) return

//     const userMessage = {
//       sender:"user",
//       text:input
//     }

//     setMessages(prev=>[...prev,userMessage])

//     setTyping(true)

//     try{

//       const response = await fetch(
//         "http://localhost:5000/chat",
//         {
//           method:"POST",
//           headers:{
//             "Content-Type":"application/json"
//           },
//           body:JSON.stringify({
//             message:input,
//             userId:userId
//           })
//         }
//       )

//       const data = await response.json()

//       const botMessage = {
//         sender:"bot",
//         text:data.reply,
//         products:Array.isArray(data.products)
//           ? data.products
//           : []
//       }

//       setMessages(prev=>[...prev,botMessage])

//     }

//     catch(error){

//       setMessages(prev=>[
//         ...prev,
//         {
//           sender:"bot",
//           text:"Sorry, something went wrong."
//         }
//       ])

//     }

//     setTyping(false)
//     setInput("")

//   }


//   return(
//     <>

//       {/* Floating Button */}

//       <div
//         onClick={()=>setOpen(!open)}
//         style={{
//           position:"fixed",
//           bottom:"20px",
//           right:"20px",
//           background:"#2e7d32",
//           color:"white",
//           width:"60px",
//           height:"60px",
//           borderRadius:"50%",
//           display:"flex",
//           justifyContent:"center",
//           alignItems:"center",
//           cursor:"pointer",
//           fontSize:"24px",
//           boxShadow:"0 4px 10px rgba(0,0,0,0.2)"
//         }}
//       >
//         💬
//       </div>


//       {open && (

//         <div
//           style={{
//             position:"fixed",
//             bottom:"90px",
//             right:"20px",
//             width:"380px",
//             height:"520px",
//             background:"white",
//             borderRadius:"12px",
//             boxShadow:"0 6px 25px rgba(0,0,0,0.25)",
//             display:"flex",
//             flexDirection:"column",
//             overflow:"hidden"
//           }}
//         >

//           {/* Header */}

//           <div
//             style={{
//               background:"#2e7d32",
//               color:"white",
//               padding:"12px",
//               fontWeight:"600"
//             }}
//           >
//             Fragrance AI Assistant
//           </div>


//           {/* Messages */}

//           <div
//             style={{
//               flex:1,
//               overflowY:"auto",
//               padding:"12px",
//               background:"#fafafa"
//             }}
//           >

//             {messages.map((msg,i)=>(

//               <div key={i}>

//                 <div
//                   style={{
//                     textAlign:
//                       msg.sender==="user"
//                         ?"right"
//                         :"left",
//                     margin:"10px 0"
//                   }}
//                 >

//                   <div
//                     style={{
//                       display:"inline-block",
//                       background:
//                         msg.sender==="user"
//                           ?"#daf1ff"
//                           :"#f3f3f3",
//                       padding:"12px",
//                       borderRadius:"10px",
//                       maxWidth:"85%",
//                       lineHeight:"1.5",
//                       fontSize:"14px",
//                       wordBreak:"break-word"
//                     }}
//                   >

//                     {msg.sender==="bot" ? (

//                       <ReactMarkdown
//                         components={{
//                           ul:props=>(
//                             <ul style={{paddingLeft:"18px"}} {...props}/>
//                           ),
//                           li:props=>(
//                             <li style={{marginBottom:"6px"}} {...props}/>
//                           ),
//                           p:props=>(
//                             <p style={{marginBottom:"6px"}} {...props}/>
//                           )
//                         }}
//                       >
//                         {msg.text}
//                       </ReactMarkdown>

//                     ):msg.text}

//                   </div>

//                 </div>


//                 {/* Product Cards */}

//                 {Array.isArray(msg.products) &&
//                   msg.products.filter(p=>p?.name).length>0 && (

//                   <div
//                     style={{
//                       display:"flex",
//                       gap:"10px",
//                       overflowX:"auto",
//                       marginBottom:"12px"
//                     }}
//                   >

//                     {msg.products
//                       .filter(p=>p?.name)
//                       .map((p,index)=>(

//                       <div
//                         key={index}
//                         style={{
//                           border:"1px solid #ddd",
//                           borderRadius:"10px",
//                           padding:"8px",
//                           minWidth:"130px",
//                           background:"#fff",
//                           textAlign:"center"
//                         }}
//                       >

//                         {p.image && (
//                           <img
//                             src={p.image}
//                             alt={p.name}
//                             style={{
//                               width:"100%",
//                               height:"90px",
//                               objectFit:"cover",
//                               borderRadius:"6px"
//                             }}
//                           />
//                         )}

//                         <div
//                           style={{
//                             fontSize:"12px",
//                             marginTop:"6px"
//                           }}
//                         >
//                           {p.name}
//                         </div>

//                         {p.price && (
//                           <div style={{fontWeight:"600"}}>
//                             ${p.price}
//                           </div>
//                         )}

//                         {p.url && (
//                           <a
//                             href={p.url}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             style={{
//                               fontSize:"11px",
//                               background:"#2e7d32",
//                               color:"white",
//                               padding:"4px 8px",
//                               borderRadius:"6px",
//                               textDecoration:"none",
//                               display:"inline-block",
//                               marginTop:"4px"
//                             }}
//                           >
//                             View
//                           </a>
//                         )}

//                       </div>

//                     ))}

//                   </div>

//                 )}

//               </div>

//             ))}


//             {/* Typing */}

//             {typing && (

//               <div style={{padding:"10px"}}>

//                 <div
//                   style={{
//                     display:"inline-block",
//                     background:"#f3f3f3",
//                     padding:"10px",
//                     borderRadius:"10px"
//                   }}
//                 >
//                   ...
//                 </div>

//               </div>

//             )}

//             <div ref={messagesEndRef}/>

//           </div>


//           {/* Input */}

//           <div
//             style={{
//               display:"flex",
//               borderTop:"1px solid #ddd"
//             }}
//           >

//             <input
//               value={input}
//               onChange={(e)=>setInput(e.target.value)}
//               onKeyDown={(e)=>{
//                 if(e.key==="Enter") sendMessage()
//               }}
//               placeholder="Ask about fragrances..."
//               style={{
//                 flex:1,
//                 padding:"10px",
//                 border:"none",
//                 outline:"none"
//               }}
//             />

//             <button
//               onClick={sendMessage}
//               style={{
//                 padding:"10px 15px",
//                 border:"none",
//                 background:"#2e7d32",
//                 color:"white",
//                 cursor:"pointer"
//               }}
//             >
//               Send
//             </button>

//           </div>

//         </div>

//       )}

//     </>
//   )

// }

// export default App





import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

function App() {
  const userId = localStorage.getItem("chatUserId") || crypto.randomUUID();
  localStorage.setItem("chatUserId", userId);

  /* Load chat history */
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved
      ? JSON.parse(saved)
      : [{ sender: "bot", text: "Hello! How can I assist you today?" }];
  });

  const [input, setInput] = useState("");
  // UPDATED: Set to true so the chat is visible immediately inside the Shopify iframe
  const [open, setOpen] = useState(true); 
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  /* Save chat history */
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  /* Auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  /* Send message */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setTyping(true);

    try {
      // UPDATED: Changed from localhost to your live Render URL
      const response = await fetch(
        "https://fragrance-chatbot-tb8u.onrender.com/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input, userId: userId }),
        }
      );

      const data = await response.json();
      const botMessage = {
        sender: "bot",
        text: data.reply,
        products: Array.isArray(data.products) ? data.products : [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong." },
      ]);
    }

    setTyping(false);
    setInput("");
  };

  return (
    <>
      {/* SUCCESS: Floating Green Button Div has been removed to prevent "Double Bubbles" */}

      {open && (
        <div
          style={{
            // UPDATED: Removed fixed positioning so it fills the Shopify iframe area
            width: "100%",
            height: "100vh", 
            background: "white",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#2e7d32",
              color: "white",
              padding: "12px",
              fontWeight: "600",
            }}
          >
            Fragrance AI Assistant
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px",
              background: "#fafafa",
            }}
          >
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  style={{
                    textAlign: msg.sender === "user" ? "right" : "left",
                    margin: "10px 0",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      background: msg.sender === "user" ? "#daf1ff" : "#f3f3f3",
                      padding: "12px",
                      borderRadius: "10px",
                      maxWidth: "85%",
                      lineHeight: "1.5",
                      fontSize: "14px",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.sender === "bot" ? (
                      <ReactMarkdown
                        components={{
                          ul: (props) => <ul style={{ paddingLeft: "18px" }} {...props} />,
                          li: (props) => <li style={{ marginBottom: "6px" }} {...props} />,
                          p: (props) => <p style={{ marginBottom: "6px" }} {...props} />,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>

                {/* Product Cards */}
                {Array.isArray(msg.products) &&
                  msg.products.filter((p) => p?.name).length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        overflowX: "auto",
                        marginBottom: "12px",
                      }}
                    >
                      {msg.products
                        .filter((p) => p?.name)
                        .map((p, index) => (
                          <div
                            key={index}
                            style={{
                              border: "1px solid #ddd",
                              borderRadius: "10px",
                              padding: "8px",
                              minWidth: "130px",
                              background: "#fff",
                              textAlign: "center",
                            }}
                          >
                            {p.image && (
                              <img
                                src={p.image}
                                alt={p.name}
                                style={{
                                  width: "100%",
                                  height: "90px",
                                  objectFit: "cover",
                                  borderRadius: "6px",
                                }}
                              />
                            )}
                            <div style={{ fontSize: "12px", marginTop: "6px" }}>
                              {p.name}
                            </div>
                            {p.price && (
                              <div style={{ fontWeight: "600" }}>${p.price}</div>
                            )}
                            {p.url && (
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: "11px",
                                  background: "#2e7d32",
                                  color: "white",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  textDecoration: "none",
                                  display: "inline-block",
                                  marginTop: "4px",
                                }}
                              >
                                View
                              </a>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
              </div>
            ))}

            {/* Typing Indicator */}
            {typing && (
              <div style={{ padding: "10px" }}>
                <div
                  style={{
                    display: "inline-block",
                    background: "#f3f3f3",
                    padding: "10px",
                    borderRadius: "10px",
                  }}
                >
                  ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              display: "flex",
              borderTop: "1px solid #ddd",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Ask about fragrances..."
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: "10px 15px",
                border: "none",
                background: "#2e7d32",
                color: "white",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;