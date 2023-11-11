(() => {

    const onClickScreenshotButton = async () => {
        const video = document.querySelector('.video-stream');
        if (video) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');

            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL('image/png');

            // Open the screenshot in a new tab
            var newWindow = window.open();
            newWindow.document.write("<img src='" + dataURL + "' alt='Image'>");
        } else {
            console.error('Video element not found');
        }

    }

    const newVideoLoaded = async () => {
        const checkButtonAlreadyCreated = document.getElementsByClassName("screenshot-btn")[0]

        if (!checkButtonAlreadyCreated) {
            const screenshotButton = document.createElement('img');
            screenshotButton.src = chrome.runtime.getURL("Button.png");
            screenshotButton.className = "ytp-button " + "screenshot-btn";
            screenshotButton.title = "Click to take screenshot";

            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubeLeftControls.appendChild(screenshotButton);

            screenshotButton.addEventListener("click", onClickScreenshotButton)

        }

    }
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        }
    });

    newVideoLoaded();
})();