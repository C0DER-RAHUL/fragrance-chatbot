import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

// ─── SVG Icons ───────────────────────────────────────────
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="1" width="6" height="12" rx="3" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

// ─── API Config ──────────────────────────────────────────
// const API_URL = "http://localhost:5000";
const API_URL = "https://fragrance-chatbot-tb8u.onrender.com";

// ─── App Component ───────────────────────────────────────
function App() {
  const userId = localStorage.getItem("chatUserId") || (() => {
    const id = crypto.randomUUID();
    localStorage.setItem("chatUserId", id);
    return id;
  })();

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved
      ? JSON.parse(saved)
      : [{
          sender: "bot",
          text: "Hello! 👋 Welcome to Fragrance AI. How can I help you find the perfect scent today?",
          suggestedQuestions: [
            "What are your best sellers?",
            "Show me woody perfumes",
            "I need a gift recommendation"
          ]
        }];
  });

  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Save chat history
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen]);

  // Hide welcome after first user message
  useEffect(() => {
    if (messages.some(m => m.sender === "user")) {
      setShowWelcome(false);
    }
  }, [messages]);

  // ─── Toggle Widget ──────────────────────────────────────
  const toggleWidget = () => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 300);
    } else {
      setIsOpen(true);
    }
  };

  // ─── Send Message ───────────────────────────────────────
  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMessage = { sender: "user", text: msg };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, userId }),
      });

      const data = await response.json();

      const botMessage = {
        sender: "bot",
        text: data.reply,
        products: Array.isArray(data.products) ? data.products : [],
        suggestedQuestions: Array.isArray(data.suggestedQuestions) ? data.suggestedQuestions : [],
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, something went wrong. Please try again! 🙏",
          suggestedQuestions: []
        },
      ]);
    }

    setIsTyping(false);
  };

  // ─── Voice Input ────────────────────────────────────────
  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  // ─── Handle Key Press ───────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── Clear Chat ─────────────────────────────────────────
  const clearChat = async () => {
    try {
      await fetch(`${API_URL}/clear-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    } catch (e) { /* ignore */ }

    const defaultMsg = [{
      sender: "bot",
      text: "Hello! 👋 Welcome to Fragrance AI. How can I help you find the perfect scent today?",
      suggestedQuestions: [
        "What are your best sellers?",
        "Show me woody perfumes",
        "I need a gift recommendation"
      ]
    }];

    setMessages(defaultMsg);
    localStorage.setItem("chatHistory", JSON.stringify(defaultMsg));
    setShowWelcome(true);
  };

  // ─── Render ─────────────────────────────────────────────
  return (
    <>
      {/* ━━━ Toggle Button ━━━ */}
      <button
        className={`chat-toggle-btn ${isOpen ? "is-open" : ""}`}
        onClick={toggleWidget}
        id="chat-toggle"
        aria-label="Toggle chat"
      >
        {!isOpen && <span className="toggle-pulse" />}
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>

      {/* ━━━ Chat Widget ━━━ */}
      {isOpen && (
        <div className={`chat-widget ${isClosing ? "closing" : ""}`} id="chat-widget">

          {/* ── Header ── */}
          <div className="chat-header">
            <img
              src="/bot-avatar.png"
              alt="Fragrance AI"
              className="chat-header-avatar"
            />
            <div className="chat-header-info">
              <div className="chat-header-name">Fragrance AI Support</div>
              <div className="chat-header-status">
                <span className="status-dot" />
                Online
              </div>
            </div>
            <div className="chat-header-actions">
              <button className="header-action-btn" onClick={clearChat} title="New Chat" aria-label="New chat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                </svg>
              </button>
              <button className="header-action-btn" title="User" aria-label="User profile">
                <UserIcon />
              </button>
              <button className="header-action-btn" onClick={toggleWidget} aria-label="Close chat">
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div className="chat-messages" id="chat-messages">

            {/* Welcome Avatar */}
            {showWelcome && (
              <div className="welcome-avatar-section">
                <img
                  src="/bot-avatar.png"
                  alt="Fragrance AI Assistant"
                  className="welcome-avatar-img"
                />
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i}>
                {/* Message Bubble */}
                <div className={`message-row ${msg.sender}`}>
                  <div className={`message-bubble ${msg.sender}`}>
                    {msg.sender === "bot" ? (
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                          ),
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
                {Array.isArray(msg.products) && msg.products.filter(p => p?.name).length > 0 && (
                  <div className="product-carousel">
                    {msg.products.filter(p => p?.name).map((p, idx) => (
                      <div className="product-card" key={idx}>
                        {p.image && (
                          <img src={p.image} alt={p.name} className="product-card-img" />
                        )}
                        <div className="product-card-name">{p.name}</div>
                        {p.price && <div className="product-card-price">${p.price}</div>}
                        {p.url && (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="product-card-link"
                          >
                            View
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Reply Suggestions */}
                {msg.sender === "bot" &&
                  Array.isArray(msg.suggestedQuestions) &&
                  msg.suggestedQuestions.length > 0 &&
                  i === messages.length - 1 && (
                    <div className="quick-replies">
                      {msg.suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          className="quick-reply-btn"
                          onClick={() => sendMessage(q)}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="message-row bot">
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                  <span className="typing-text">Thinking ...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input Area ── */}
          <div className="chat-input-area">
            <div className="chat-input-wrapper">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask us anything..."
                id="chat-input"
              />
              <button
                className={`mic-btn ${isRecording ? "recording" : ""}`}
                onClick={toggleVoice}
                title={isRecording ? "Stop recording" : "Voice input"}
                aria-label="Voice input"
              >
                <MicIcon />
              </button>
              <button
                className={`send-btn ${input.trim() ? "active" : ""}`}
                onClick={() => sendMessage()}
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="chat-footer">
            Made with <span>❤️</span> by Fragrance AI
          </div>
        </div>
      )}
    </>
  );
}

export default App;