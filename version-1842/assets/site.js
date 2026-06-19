(function () {
  var navButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = hero.querySelector('[data-hero-dots]');
    var index = 0;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      if (dots) {
        Array.prototype.slice.call(dots.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }
    }

    if (dots) {
      slides.forEach(function (_, dotIndex) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换推荐');
        dot.addEventListener('click', function () {
          showSlide(dotIndex);
        });
        dots.appendChild(dot);
      });
    }

    showSlide(0);

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var liveAreas = document.querySelectorAll('.cards-live, .ranking-list');

  function applyFilters(scope) {
    var container = scope.closest('main') || document;
    var queryInput = container.querySelector('.search-input');
    var typeFilter = container.querySelector('[data-filter="type"]');
    var yearFilter = container.querySelector('[data-filter="year"]');
    var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
    var typeValue = typeFilter ? typeFilter.value : '';
    var yearValue = yearFilter ? yearFilter.value : '';
    var cards = container.querySelectorAll('[data-card]');

    cards.forEach(function (card) {
      var searchable = (card.getAttribute('data-search') || '').toLowerCase();
      var type = card.getAttribute('data-type') || '';
      var year = card.getAttribute('data-year') || '';
      var matched = true;

      if (query && searchable.indexOf(query) === -1) {
        matched = false;
      }

      if (typeValue && type.indexOf(typeValue) === -1) {
        matched = false;
      }

      if (yearValue && year !== yearValue) {
        matched = false;
      }

      card.classList.toggle('is-hidden', !matched);
    });
  }

  liveAreas.forEach(function (area) {
    var container = area.closest('main') || document;
    var controls = container.querySelectorAll('.search-input, .filter-select');

    controls.forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilters(area);
      });
      control.addEventListener('change', function () {
        applyFilters(area);
      });
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-cover');
    var status = player.parentElement.querySelector('.player-status');
    var loaded = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function bindStream() {
      if (!video || loaded) {
        return;
      }

      var stream = video.getAttribute('data-stream');

      if (!stream) {
        setStatus('播放暂时无法启动');
        return;
      }

      loaded = true;
      setStatus('正在加载影片...');

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().then(function () {
            setStatus('');
          }).catch(function () {
            setStatus('点击视频继续播放');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus('播放暂时无法启动');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          video.play().then(function () {
            setStatus('');
          }).catch(function () {
            setStatus('点击视频继续播放');
          });
        }, { once: true });
      } else {
        video.src = stream;
        video.play().then(function () {
          setStatus('');
        }).catch(function () {
          setStatus('播放暂时无法启动');
        });
      }
    }

    if (button) {
      button.addEventListener('click', function () {
        button.classList.add('hidden');
        bindStream();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!loaded) {
          if (button) {
            button.classList.add('hidden');
          }
          bindStream();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });
    }
  });
})();
