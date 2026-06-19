(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var input = panel.querySelector("[data-filter-search]");
    var region = panel.querySelector("[data-filter-region]");
    var year = panel.querySelector("[data-filter-year]");
    var type = panel.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
    var noResults = document.querySelector("[data-no-results]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && input) {
      input.value = query;
    }

    function includesText(base, needle) {
      return base.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
    }

    function apply() {
      var q = input ? input.value.trim() : "";
      var r = region ? region.value : "";
      var y = year ? year.value : "";
      var t = type ? type.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.type, card.dataset.tags].join(" ");
        var ok = true;
        if (q && !includesText(text, q)) {
          ok = false;
        }
        if (r && card.dataset.region !== r) {
          ok = false;
        }
        if (y && card.dataset.year !== y) {
          ok = false;
        }
        if (t && card.dataset.type !== t) {
          ok = false;
        }
        card.classList.toggle("hidden-by-filter", !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, region, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  window.initMoviePlayer = function (streamUrl, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var loaded = false;
    var player = null;

    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        player = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        player.loadSource(streamUrl);
        player.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      attach();
      if (button) {
        button.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });
    video.addEventListener("ended", function () {
      if (button) {
        button.classList.remove("is-hidden");
      }
    });
    attach();
    window.addEventListener("beforeunload", function () {
      if (player && typeof player.destroy === "function") {
        player.destroy();
      }
    });
  };

  ready(function () {
    setupNav();
    setupHero();
    setupFilters();
  });
})();
