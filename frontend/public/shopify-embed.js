/**
 * Fragrance AI Chatbot - Shopify Embed Script
 * 
 * Add this script to your Shopify theme's theme.liquid file
 * just before the closing </body> tag.
 * 
 * Usage:
 *   <script src="https://YOUR-VERCEL-URL.vercel.app/shopify-embed.js"></script>
 *   OR copy-paste the contents directly into a <script> tag.
 */

(function () {
  // ─── Configuration ─────────────────────────────────────
  // Replace this with your deployed frontend URL (Vercel/Netlify)
  const CHATBOT_URL = "https://vartta-ai.netlify.app";

  // ─── Prevent double-loading ────────────────────────────
  if (window.__fragranceChatbotLoaded) return;
  window.__fragranceChatbotLoaded = true;

  // ─── Create the iframe ─────────────────────────────────
  const iframe = document.createElement("iframe");
  iframe.src = CHATBOT_URL;
  iframe.id = "fragrance-chatbot-iframe";
  iframe.allow = "microphone"; // needed for voice input
  iframe.style.cssText = `
    position: fixed;
    bottom: 0;
    right: 0;
    width: 480px;
    height: 700px;
    max-height: 100vh;
    max-width: 100vw;
    border: none;
    z-index: 999999;
    background: transparent;
    pointer-events: none;
  `;

  // ─── Make only the widget clickable (not the background) ──
  // The iframe itself has pointer-events: none so Shopify page
  // stays interactive. The React app inside handles its own clicks.
  // We toggle pointer-events when the user interacts.

  iframe.addEventListener("load", () => {
    // Enable pointer events on the iframe area
    iframe.style.pointerEvents = "auto";
  });

  // ─── Responsive: full screen on mobile ─────────────────
  function applyResponsive() {
    if (window.innerWidth <= 480) {
      iframe.style.width = "100vw";
      iframe.style.height = "100vh";
    } else {
      iframe.style.width = "480px";
      iframe.style.height = "700px";
    }
  }

  applyResponsive();
  window.addEventListener("resize", applyResponsive);

  // ─── Inject into page ──────────────────────────────────
  document.body.appendChild(iframe);
})();
