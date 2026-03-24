async function processHeadline(el) {
  const headlineText = el.innerText.trim();
  if (!headlineText || headlineText.length < 5) return;

  try {
    // 1. Call your Flask API (Update the URL to your Render/Production URL)
    const response = await fetch('https://your-api-url.render.com/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ headline: headlineText })
    });

    const data = await response.json();

    if (data.is_clickbait) {
      // 🚩 CLICKBAIT DETECTED
      el.style.filter = "blur(4px) grayscale(100%)";
      el.style.opacity = "0.6";
      el.style.transition = "all 0.3s ease";
      el.title = `Clickbait Probability: ${Math.round(data.probability * 100)}% - Click to reveal`;

      // Update Chrome Storage Counter
      chrome.storage.local.get(['baitBlocked'], (result) => {
        let count = result.baitBlocked || 0;
        let newCount = count + 1;
        chrome.storage.local.set({ baitBlocked: newCount });

        // Update the extension badge text (optional but professional)
        chrome.action.setBadgeText({ text: newCount.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
      });

    } else {
      // 🛡️ SAFE CONTENT
      el.style.borderLeft = "4px solid #22d3ee"; // Subtle Cyan Glow
      el.style.paddingLeft = "10px";
      el.style.backgroundColor = "rgba(34, 211, 238, 0.05)";
    }

  } catch (e) {
    console.error("AI Clickbait Detector - Backend Offline or CORS Error:", e);
    // Silent fail to ensure user experience isn't broken
  }
}

// Optimization: Use a small delay so we don't spam the API during page load
function debounceScan() {
  const headlines = document.querySelectorAll('h1, h2, h3, .headline, .title'); 
  headlines.forEach(el => processHeadline(el));
}

// Initialize scan
debounceScan();