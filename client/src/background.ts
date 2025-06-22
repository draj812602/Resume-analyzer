// Background script for Resume Analyzer extension
console.log("Resume Analyzer background script loaded");

interface BackgroundMessage {
  action: "analyzeResume";
  data?: unknown;
}

interface BackgroundResponse {
  status: string;
  data?: unknown;
}

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Resume Analyzer extension installed");
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener(
  (
    request: BackgroundMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: BackgroundResponse) => void
  ) => {
    console.log("Background script received message:", request);

    if (request.action === "analyzeResume") {
      // Handle resume analysis request
      sendResponse({ status: "received" });
    }
  }
);
