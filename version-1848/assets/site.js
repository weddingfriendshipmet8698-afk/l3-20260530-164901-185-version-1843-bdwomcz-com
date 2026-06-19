
(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupMenu() {
        var button = one('[data-menu-button]');
        var menu = one('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slides = all('.hero-slide');
        var dots = all('.hero-dot');
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5600);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        show(0);
        start();
    }

    function setupLocalFilter() {
        all('[data-filter-wrap]').forEach(function (wrap) {
            var input = one('[data-filter-input]', wrap);
            var cards = all('.movie-card', wrap);
            var empty = one('[data-empty-state]', wrap);
            if (!input || !cards.length) {
                return;
            }
            function apply() {
                var query = normalize(input.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var match = !query || text.indexOf(query) !== -1;
                    card.style.display = match ? '' : 'none';
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }
            input.addEventListener('input', apply);
            var button = one('.filter-button', wrap);
            if (button) {
                button.addEventListener('click', apply);
            }
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query && input.value === '') {
                input.value = query;
            }
            apply();
        });
    }

    function setupForms() {
        all('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = './search.html';
                }
            });
        });
    }

    function setupPlayer() {
        var shell = one('[data-player-shell]');
        if (!shell) {
            return;
        }
        var video = one('video', shell);
        var overlay = one('[data-play-overlay]', shell);
        if (!video || !overlay) {
            return;
        }
        var streamUrl = video.getAttribute('data-stream');
        var initialized = false;
        var hlsInstance = null;

        function attachStream() {
            if (initialized) {
                return Promise.resolve();
            }
            initialized = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                });
            }
            video.src = streamUrl;
            return Promise.resolve();
        }

        function playVideo() {
            if (!streamUrl) {
                return;
            }
            shell.classList.add('is-playing');
            attachStream().then(function () {
                var playPromise = video.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {});
                }
            });
        }

        overlay.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });
        video.addEventListener('ended', function () {
            shell.classList.remove('is-playing');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupForms();
        setupLocalFilter();
        setupPlayer();
    });
})();
