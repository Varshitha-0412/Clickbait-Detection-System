// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "predict") {
    // 1. Fetch from your AI Backend
    fetch('https://clickbait-detector-api-uxg6.onrender.com/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ headline: request.headline })
    })
    .then(response => response.json())
    .then(data => {
      if (data.is_clickbait) {
        // 2. Update the Badge if it's clickbait
        chrome.storage.local.get(['baitBlocked'], (result) => {
          let newCount = (result.baitBlocked || 0) + 1;
          chrome.storage.local.set({ baitBlocked: newCount });
          chrome.action.setBadgeText({ text: newCount.toString() });
          chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
        });
      }
      sendResponse({ success: true, data });
    })
    .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Keeps the message channel open for async response
  }
});