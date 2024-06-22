(() => {

    // Open the IndexedDB database
    const dbPromise = new Promise(function (resolve, reject) {
        const request = indexedDB.open('ScreenshotExtensionDB', 1);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore('ScreenshotData', { keyPath: 'time' });
        };

        request.onsuccess = function (event) {
            resolve(event.target.result);
            // console.log("Database Created");
        };

        request.onerror = function (event) {
            reject('Error opening database');
        };
    });

    // function to handle data storage in IndexedDB
    function saveImageData(imageData) {
        dbPromise.then(function (db) {
            const transaction = db.transaction(['ScreenshotData'], 'readwrite');
            const objectStore = transaction.objectStore('ScreenshotData');

            objectStore.add({ time: Date.now(), imageData: imageData });

            transaction.oncomplete = function () {
                console.log('Image data saved for video');
            };
        }).catch(function (error) {
            console.error(error);
        });
    }

    // Function to get data from the IndexedDB
    function getDataFromDB() {
        return new Promise(function (resolve, reject) {
            const transaction = dbPromise.then(db => {
                const objectStore = db.transaction('ScreenshotData').objectStore('ScreenshotData');

                // Open a cursor to iterate over the items in the object store
                const request = objectStore.openCursor();

                const data = [];

                // Handle the success event for the cursor request
                request.onsuccess = function (event) {
                    const cursor = event.target.result;

                    if (cursor) {
                        // Push the data from the cursor into the array
                        data.push(cursor.value);

                        // Move to the next item in the object store
                        cursor.continue();
                    } else {
                        // Resolve the promise with the collected data
                        resolve(data);
                    }
                };
                // Handle errors for the cursor request
                request.onerror = function (event) {
                    reject('Error getting data from the object store');
                };
            });

            // Handle errors for the transaction
            transaction.catch(error => {
                reject(error);
            });
        });
    }


    const onClickScreenshotButton = async () => {
        const video = document.querySelector('.video-stream');
        if (video) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');

            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL('image/png');

            saveImageData(dataURL);

        } else {
            console.error('Video element not found');
        }
    }

    const newVideoLoaded =  () => {
        const checkButtonAlreadyCreated = document.getElementsByClassName("screenshot-btn")[0]

        if (!checkButtonAlreadyCreated) {
            const screenshotButton = document.createElement('div');
            screenshotButton.innerHTML = '<svg class="w-[48px] h-[48px] mt-7 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 12h14m-7 7V5"/></svg>';            
            screenshotButton.className = "ytp-button " + "screenshot-btn " + "ytp-miniplayer-button";
            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubeLeftControls.appendChild(screenshotButton);
            screenshotButton.addEventListener("click", onClickScreenshotButton);
        }
    }

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type } = obj;

        if (type === "NEW") {
            newVideoLoaded();
            requestDataFromDB();
        }
    });

    function requestDataFromDB(){
        getDataFromDB().then((data) => {
            chrome.runtime.sendMessage({ type: "SENDING-DB-DATA-TO-BACKGROUND-SCRIPT", data: data });
            // console.log("Data sent to background script");
        }).catch(error => {
            console.error('An error occurred:', error);
          });
    }

    newVideoLoaded();
    setInterval(requestDataFromDB, 2000);
})();

