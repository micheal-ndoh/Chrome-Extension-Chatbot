chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extract_page_text") {
    // Extract visible text from the body
    const bodyText = document.body.innerText || "";
    // Limit to first 8000 characters to avoid API limits
    sendResponse({ text: bodyText.slice(0, 8000) });
  }
});