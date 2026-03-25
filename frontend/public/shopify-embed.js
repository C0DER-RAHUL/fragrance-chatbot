/**
 * Fragrance AI Chatbot - Shopify Embed Script
 * 
 * Add this script to your Shopify theme's theme.liquid file
 * just before the closing </body> tag.
 * 
 * Usage:
 *   <script src="https://vartta-ai.netlify.app/shopify-embed.js"></script>
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

  // ─── PostMessage Listener for Add to Cart ────────────────
  window.addEventListener("message", async (event) => {
    // Basic security check (allow any origin for now, but check structure)
    if (!event.data || typeof event.data !== "object") return;

    if (event.data.type === "FRAGRANCE_ADD_TO_CART" && event.data.url) {
      try {
        // 1. Fetch the product page quietly
        const res = await fetch(event.data.url);
        const html = await res.text();
        
        // 2. Parse the HTML to find the Variant ID
        const doc = new DOMParser().parseFromString(html, "text/html");
        
        // Find the variant ID in the add to cart form
        const idInput = doc.querySelector('form[action*="/cart/add"] [name="id"], input[name="id"]');
        if (!idInput || !idInput.value) {
          console.error("Fragrance AI: Could not find variant ID on product page.");
          alert("Couldn't add to cart automatically. Please click 'View' to add it manually.");
          return;
        }

        const variantId = idInput.value;

        // 3. Call Shopify's AJAX Cart API
        await fetch(window.Shopify?.routes?.root + "cart/add.js" || "/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [{ id: parseInt(variantId), quantity: 1 }]
          })
        });

        // 4. Redirect to cart or trigger theme cart drawer
        // (Redirecting to cart is the safest universal method for all Shopify themes)
        window.location.href = "/cart";

      } catch (err) {
        console.error("Fragrance AI: Cart error", err);
      }
    }
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
