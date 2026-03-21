// Function to scan for headlines
async function scanHeadlines() {
  const headlines = document.querySelectorAll('[data-testid="tweetText"]');

  headlines.forEach(async (el) => {
    if (el.dataset.scanned) return;
    el.dataset.scanned = "true";

    const text = el.innerText;

    try {
      // Connect to your LIVE Render Backend
      const response = await fetch("https://clickbait-detector-api-uxg6.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline: text })
      });

      const data = await response.json();

      if (data.is_clickbait) {
        // 🔥 Apply Neon Red "DANGER" Glow to Clickbait
        el.style.transition = "all 0.5s ease-in-out";
        el.style.boxShadow = "0 0 15px rgba(239, 68, 68, 0.6)";
        el.style.border = "2px solid #ef4444";
        el.style.backgroundColor = "rgba(239, 68, 68, 0.05)";
        el.style.borderRadius = "12px";
        el.style.padding = "10px";

        // Update Chrome Storage Counter
        chrome.storage.local.get(['baitBlocked'], (result) => {
          let count = result.baitBlocked || 0;
          chrome.storage.local.set({ baitBlocked: count + 1 });
        });
      } else {
        // 🛡️ Apply Subtle Cyan "SAFE" Glow to Verified Content
        el.style.borderLeft = "4px solid #22d3ee";
        el.style.paddingLeft = "10px";
      }
    } catch (e) {
      console.error("AI Backend Offline or CORS Error:", e);
    }
  });
}

// Run every 3 seconds to catch new tweets as you scroll
setInterval(scanHeadlines, 3000);