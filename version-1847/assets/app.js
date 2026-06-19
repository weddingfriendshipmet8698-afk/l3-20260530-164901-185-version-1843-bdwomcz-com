(function () {
  var menuButton = document.querySelector('.menu-toggle');
  if (menuButton) {
    menuButton.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var current = 0;
    var activate = function (index) {
      current = index % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
      });
    });
    window.setInterval(function () {
      activate(current + 1);
    }, 5200);
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var input = filterRoot.querySelector('[data-filter-input]');
    var selects = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-filter-select]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-title]'));
    var status = document.querySelector('[data-filter-status]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input && initial) {
      input.value = initial;
    }
    var match = function (card, query) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-type')
      ].join(' ').toLowerCase();
      if (query && text.indexOf(query) === -1) {
        return false;
      }
      for (var i = 0; i < selects.length; i += 1) {
        var select = selects[i];
        var key = select.getAttribute('data-filter-select');
        var value = select.value;
        if (value && (card.getAttribute('data-' + key) || '').indexOf(value) === -1) {
          return false;
        }
      }
      return true;
    };
    var apply = function () {
      var query = input ? input.value.trim().toLowerCase() : '';
      var shown = 0;
      cards.forEach(function (card) {
        var ok = match(card, query);
        card.hidden = !ok;
        if (ok) {
          shown += 1;
        }
      });
      if (status) {
        status.textContent = shown > 0 ? '已匹配影片' : '未找到匹配影片';
      }
    };
    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    apply();
  }
}());

function initPlayer(videoId, sourceUrl, shellId) {
  var video = document.getElementById(videoId);
  var shell = document.getElementById(shellId);
  if (!video || !shell || !sourceUrl) {
    return;
  }
  var overlay = shell.querySelector('.play-overlay');
  var ready = false;
  var hlsInstance = null;
  var attach = function () {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  };
  var start = function () {
    attach();
    shell.classList.add('is-playing');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  };
  if (overlay) {
    overlay.addEventListener('click', start);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });
  video.addEventListener('ended', function () {
    shell.classList.remove('is-playing');
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
