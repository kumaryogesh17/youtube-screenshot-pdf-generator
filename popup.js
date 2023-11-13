document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.sendMessage({ type: 'popupMessage', data: 'Hello from popup!' });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === 'SENDING-DB-DATA-TO-POPUP.JS') {
        //   console.log('Message received in background:', message.data);

        const screenshotContainer = document.getElementById("screenshotContainer");

        if (screenshotContainer) {
            screenshotContainer.innerHTML = '';

            message.data.forEach((obj, index) => {
                const newImage = document.createElement('img');
                newImage.src = obj.imageData;
                newImage.style.width = '200px';
                newImage.style.height = '200px';
                newImage.alt = `Image ${index + 1}`;

                screenshotContainer.appendChild(newImage);
            });
        }
    }
});
