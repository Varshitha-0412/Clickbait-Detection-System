// Function to scan for headlines
async function scanHeadlines() {
  const headlines = document.querySelectorAll('[data-testid="tweetText"]');

  headlines.forEach(async (el) => {
    if (el.dataset.scanned) return;
    el.dataset.scanned = "true";

    const text = el.innerText;

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline: text })
      });
      const data = await response.json();

      if (data.is_clickbait) {
        // Apply Neon Red Glow to the Tweet
        el.style.boxShadow = "0 0 20px rgba(239, 68, 68, 0.4)";
        el.style.border = "1px solid rgba(239, 68, 68, 0.5)";
        el.style.borderRadius = "12px";
        el.style.padding = "10px";

        // Increment Global Blocked Counter in Chrome Storage
        chrome.storage.local.get(['baitBlocked'], (result) => {
          let count = result.baitBlocked || 0;
          chrome.storage.local.set({ baitBlocked: count + 1 });
        });
      } else {
        // Apply Subtle Cyan Glow to Safe Content
        el.style.borderLeft = "4px solid #22d3ee";
      }
    } catch (e) {
      console.log("AI Backend Offline.");
    }
  });
}

// Run every 3 seconds
setInterval(scanHeadlines, 3000);