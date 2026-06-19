function initMoviePlayer(videoId, buttonId, playbackSource) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hlsPlayer = null;
    var isReady = false;

    if (!video || !playbackSource) {
        return;
    }

    function markPlaying() {
        if (button) {
            button.classList.add("is-hidden");
        }
    }

    function showButton() {
        if (button) {
            button.classList.remove("is-hidden");
        }
    }

    function playVideo() {
        markPlaying();

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (!video.getAttribute("src")) {
                video.setAttribute("src", playbackSource);
            }

            video.play().catch(showButton);
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!hlsPlayer) {
                hlsPlayer = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hlsPlayer.loadSource(playbackSource);
                hlsPlayer.attachMedia(video);
                hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    isReady = true;
                    video.play().catch(showButton);
                });
            } else if (isReady) {
                video.play().catch(showButton);
            }

            return;
        }

        if (!video.getAttribute("src")) {
            video.setAttribute("src", playbackSource);
        }

        video.play().catch(showButton);
    }

    if (button) {
        button.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener("play", markPlaying);
    video.addEventListener("pause", function () {
        if (!video.ended) {
            showButton();
        }
    });
}
