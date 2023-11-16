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
        //   console.log('Message received in background:', message.data);

        const total = document.getElementById('totalData');
        if (total) {
            total.innerHTML = message.data.length;
        }

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

