let data = null;


// // Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "SENDING-DB-DATA-TO-BACKGROUND-SCRIPT") {
    console.log("Message received in background:", message.data);

    data = message.data;

    // Send a response back to the content script
    sendResponse({ response: "Message received in the background script!" });
  }
});


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === 'popupMessage') {
    console.log('Message received in background:', message.data);
    chrome.runtime.sendMessage({ type: "SENDING-DB-DATA-TO-POPUP.JS", data: data });
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === 'downloadPDF') {
    // console.log('Message received in background:', message.data);
    chrome.runtime.sendMessage({ type: "SENDING-DB-DATA-FOR-DOWNLOAD", data: data });
  }
});

chrome.runtime.onInstalled.addListener(function (details) {
      chrome.tabs.sendMessage( {
      type: "NEW",
    });
  });