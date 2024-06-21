import { default as jsPDF } from "jspdf";
import React, { useEffect,useRef } from "react";
import { render } from "react-dom";
import './popup.css';

function Popup() {

    const totalRef = useRef(null);
    const screenshotContainerRef = useRef(null);

    useEffect(() => {
        chrome.runtime.sendMessage({ type: 'popupMessage', data: 'Hello from popup!' });

        const downloadButton = document.getElementById("downloadPDF");
        if (downloadButton) {
            downloadButton.addEventListener("click", downloadFunction);
        } else {
            console.error('Element with id "downloadPDF" was not found');
        }

        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'SENDING-DB-DATA-TO-POPUP.JS') {
                handleIncomingData(message.data);
            } else if (message.type === 'SENDING-DB-DATA-FOR-DOWNLOAD' && message.data) {
                handleDownloadPDF(message.data);
            }
        });

        return () => {
            if (downloadButton) {
                downloadButton.removeEventListener("click", downloadFunction);
            }
        }
    }, []);


    const downloadFunction = () => {
        console.log("Download PDF button clicked");
        chrome.runtime.sendMessage({ type: 'downloadPDF' });
    };


    const handleIncomingData = (data) => {
        const total = document.getElementById('totalData');
        const screenshotContainer = document.getElementById("screenshotContainer");

        if (totalRef.current) {
            totalRef.current.innerHTML = data.length;
        }

        if (screenshotContainerRef) {
            screenshotContainerRef.current.innerHTML = '';

            data.forEach((obj, index) => {
                const newImage = document.createElement('img');
                newImage.src = obj.imageData;
                newImage.alt = `Image ${index + 1}`;
                newImage.classList.add('h-full', 'max-w-full', 'rounded-lg');
                screenshotContainer.appendChild(newImage);
            });

        }
    };

    const handleDownloadPDF = (data) => {
        const pdf = new jsPDF('l', 'mm', 'a4');
        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();

        data.forEach((obj, index) => {
            if (obj && obj.imageData) {
                pdf.addImage(obj.imageData, 'JPEG', 0, 0, width, height);
                if (index !== data.length - 1) {
                    pdf.addPage();
                }
            }
        });

        pdf.save("download.pdf");
    };

    return (
        <div className="h-[400px] w-[400px]  text-center font-bold p-4">
            <div className="text-center text-lg">Total Screenshot: <span ref={totalRef}></span></div>
            <div className="mb-8 mt-4">
                <a href="#_" onClick={downloadFunction} class="box-border relative z-30 inline-flex items-center justify-center w-auto px-8 py-3 overflow-hidden font-bold text-white transition-all duration-300 bg-indigo-600 rounded-md cursor-pointer group ring-offset-2 ring-1 ring-indigo-300 ring-offset-indigo-200 hover:ring-offset-indigo-500 ease focus:outline-none">
                    <span class="absolute bottom-0 right-0 w-8 h-20 -mb-8 -mr-5 transition-all duration-300 ease-out transform rotate-45 translate-x-1 bg-white opacity-10 group-hover:translate-x-0"></span>
                    <span class="absolute top-0 left-0 w-20 h-8 -mt-1 -ml-12 transition-all duration-300 ease-out transform -rotate-45 -translate-x-1 bg-white opacity-10 group-hover:translate-x-0"></span>
                    <span class="relative z-20 flex items-center text-sm">
                        <svg class="relative w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Download
                    </span>
                </a>
            </div>
            <div id="screenshotContainer" ref={screenshotContainerRef} className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4"></div>
        </div>

    );
}

render(<Popup />, document.getElementById("popup-root"));
