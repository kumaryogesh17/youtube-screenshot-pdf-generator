import { default as jsPDF } from "jspdf";

document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.sendMessage({ type: 'popupMessage', data: 'Hello from popup!' });

    const download = document.getElementById("downloadPDF");
    if (download) {
        download.addEventListener("click", downloadFunction);
    } else {
        console.error('Element with id "downloadPDF" was not found');
    }
});

function downloadFunction() {
    console.log("hello");
    chrome.runtime.sendMessage({ type: 'downloadPDF' });
}


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === 'SENDING-DB-DATA-TO-POPUP.JS') {
        const total = document.getElementById('totalData');
        const screenshotContainer = document.getElementById("screenshotContainer");
        const dataContainer = document.querySelector('.DataContainer');
        const headline = document.getElementById('headline');

        if (total) {
            total.innerHTML = message.data.length;
        }

        if (screenshotContainer) {
            screenshotContainer.innerHTML = '';

            if (message.data.length === 0) {
                const newCard = document.createElement('div');
                newCard.textContent = 'No screenshots available. Please use the Add button to capture a new screenshot.';
                screenshotContainer.appendChild(newCard);

                // Hide DataContainer and headline
                if (dataContainer) dataContainer.style.display = 'none';
                if (headline) headline.style.display = 'none';
            } else {
                // Show DataContainer and headline
                if (dataContainer) dataContainer.style.display = 'block';
                if (headline) headline.style.display = 'block';

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
    }
});


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message && message.type === 'SENDING-DB-DATA-FOR-DOWNLOAD' && message.data) {
        console.log('Message received in background:', message.data);

        const pdf = new jsPDF('l','mm','a4');
        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();

        message.data.forEach((obj, index) => {
            if (obj && obj.imageData) {
                pdf.addImage(obj.imageData, 'JPEG', 0, 0, width,height);
                if (index !== message.data.length - 1) {
                    pdf.addPage();
                }
            }
        });

        pdf.save("download.pdf");
    }
});

