// Function to scan for headlines
async function scanHeadlines() {
  const headlines = document.querySelectorAll('[data-testid="tweetText"]');

  headlines.forEach(async (el) => {
    if (el.dataset.scanned) return;
    el.dataset.scanned = "true";

    const text = el.innerText;

    try {
      // Connect to your LIVE Render Backend
      // Replace lines 13-20 in your code with this:
chrome.runtime.sendMessage({ action: "predict", text: text }, (response) => {
  if (response && response.success) {
    const data = response.data;
    if (data.is_clickbait) {
       // Apply your red glow styles here...
    }
  }
});

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