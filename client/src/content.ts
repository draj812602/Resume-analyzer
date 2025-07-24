// Content script for Resume Analyzer extension
console.log("Resume Analyzer content script loaded");

interface MessageRequest {
  action: "extractText" | "getSelectedText";
}

interface MessageResponse {
  text: string;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(
  (
    request: MessageRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ) => {
    if (request.action === "extractText") {
      // Extract text from the current page
      const pageText: string = document.body.innerText;
      sendResponse({ text: pageText });
    }

    if (request.action === "getSelectedText") {
      // Get selected text from the page
      const selectedText: string = window.getSelection()?.toString() || "";
      sendResponse({ text: selectedText });
    }
  }
);

// Inject a button or UI element if needed
function injectUI(): void {
  // You can add custom UI elements here if needed
  console.log("UI injection ready");
}

// Initialize when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectUI);
} else {
  injectUI();
}

// Listen for messages from the web app
window.addEventListener("message", (event) => {
  // Only accept messages from the web app origin
  if (event.origin !== "http://localhost:5173") return;
  if (event.data.type === "RESUME_ANALYZER_USER") {
    chrome.storage.local.set({
      userId: event.data.id,
      userName: event.data.name,
    });
    console.log("User info saved to chrome.storage:", event.data);
  }
});
