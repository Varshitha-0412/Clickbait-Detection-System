// content.js
async function processHeadline(el) {
  const headlineText = el.innerText.trim();
  if (!headlineText || headlineText.length < 5 || el.dataset.scanned) return;
  el.dataset.scanned = "true"; // Prevent duplicate scans

  // Send message to background.js
  chrome.runtime.sendMessage({ action: "predict", headline: headlineText }, (response) => {
    if (response && response.success) {
      const data = response.data;

      if (data.is_clickbait) {
        // 🚩 STYLE AS CLICKBAIT
        el.style.filter = "blur(4px) grayscale(100%)";
        el.style.opacity = "0.6";
        el.style.transition = "all 0.3s ease";
        el.title = `Clickbait: ${Math.round(data.probability * 100)}% - Hover to reveal`;
        
        // Reveal on hover
        el.onmouseenter = () => { el.style.filter = "none"; el.style.opacity = "1"; };
        el.onmouseleave = () => { el.style.filter = "blur(4px) grayscale(100%)"; el.style.opacity = "0.6"; };
      } else {
        // 🛡️ STYLE AS SAFE
        el.style.borderLeft = "4px solid #22d3ee";
        el.style.paddingLeft = "10px";
      }
    }
  });
}

// Debounce to avoid crashing the API
function initScan() {
  const headlines = document.querySelectorAll('h1, h2, h3, .headline, .title, [data-testid="tweetText"]');
  headlines.forEach(el => processHeadline(el));
}

// Run on load and on scroll
window.addEventListener('scroll', () => {
    clearTimeout(window.scanTimer);
    window.scanTimer = setTimeout(initScan, 1000);
});
initScan();