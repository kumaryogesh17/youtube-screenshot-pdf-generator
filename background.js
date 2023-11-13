chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
    });
  }
 
});

// background.js

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "contentScriptMessage") {
      // Handle the message from the content script
      console.log("Message received in background:", message.data);

      // Send a response back to the content script
      sendResponse({ response: "Message received in the background script!" });
  }
});
