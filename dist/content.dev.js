"use strict";

function extractBodyText() {
  let text = document.body?.innerText || document.documentElement?.innerText || "";
  return text.trim().slice(0, 8000);
}

function waitForContent(minLength = 100, timeout = 5000) {
  return new Promise((resolve) => {
    let start = Date.now();

    function check() {
      const text = extractBodyText();
      if (text.length >= minLength) {
        resolve(text);
        return true;
      }
      if (Date.now() - start > timeout) {
        resolve(text); // Return whatever we have after timeout
        return true;
      }
      return false;
    }

    if (check()) return;

    const observer = new MutationObserver(() => {
      if (check()) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    // Fallback: stop after timeout
    setTimeout(() => {
      observer.disconnect();
      resolve(extractBodyText());
    }, timeout);
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "extract_page_text") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        waitForContent().then(text => sendResponse({ text }));
      }, { once: true });
      return true;
    }
    waitForContent().then(text => sendResponse({ text }));
    return true;
  }
});