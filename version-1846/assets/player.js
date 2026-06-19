function setupPlayer(videoId, streamUrl) {
    const video = document.getElementById(videoId);
    if (!video || !streamUrl) return;

    const wrapper = video.closest('.player-wrap');
    const startButton = wrapper ? wrapper.querySelector('.player-start') : null;

    function playVideo() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== streamUrl) video.src = streamUrl;
            video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
            if (!video.__hlsReady) {
                const hls = new Hls();
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video.__hlsReady = true;
            }
            video.play().catch(function () {});
        }
        if (startButton) startButton.classList.add('hidden');
    }

    if (startButton) {
        startButton.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });
}
