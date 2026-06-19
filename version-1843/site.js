
(function () {
  function q(root, sel) { return root.querySelector(sel); }
  function qa(root, sel) { return Array.from(root.querySelectorAll(sel)); }

  function initSearchScope(scope) {
    var input = q(scope, '[data-search-input]');
    var sortSelect = q(scope, '[data-sort-select]');
    var resetBtn = q(scope, '[data-reset-filter]');
    var cards = qa(scope, '[data-searchable]');
    if (!input || !cards.length) return;

    function filterCards() {
      var term = (input.value || '').trim().toLowerCase();
      var sortMode = sortSelect ? sortSelect.value : 'hot';
      var items = cards.slice();
      items.forEach(function (card) {
        var text = (card.getAttribute('data-searchable') || '').toLowerCase();
        var ok = !term || text.indexOf(term) !== -1;
        card.style.display = ok ? '' : 'none';
      });
      var visible = items.filter(function (card) { return card.style.display !== 'none'; });
      if (sortMode === 'year') {
        visible.sort(function (a, b) { return (parseInt(b.getAttribute('data-year') || '0', 10) || 0) - (parseInt(a.getAttribute('data-year') || '0', 10) || 0); });
      } else if (sortMode === 'title') {
        visible.sort(function (a, b) { return (a.getAttribute('data-searchable') || '').localeCompare(b.getAttribute('data-searchable') || '', 'zh-Hans-CN'); });
      }
      if (sortMode !== 'hot') {
        visible.forEach(function (card) { card.parentElement.appendChild(card); });
      }
    }

    input.addEventListener('input', filterCards);
    if (sortSelect) sortSelect.addEventListener('change', filterCards);
    if (resetBtn) resetBtn.addEventListener('click', function () {
      input.value = '';
      if (sortSelect) sortSelect.value = 'hot';
      cards.forEach(function (card) { card.style.display = ''; });
      filterCards();
      input.focus();
    });
  }

  function playWithSource(player) {
    var video = q(player, 'video');
    if (!video) return;
    var overlay = q(player, '.player-overlay');
    var source = player.getAttribute('data-source');
    var fallbackM3u8 = player.getAttribute('data-fallback-m3u8') || '';
    var fallbackMp4 = player.getAttribute('data-fallback-mp4') || '';
    var currentPhase = 'primary';

    function showOverlay(show) {
      if (overlay) overlay.style.display = show ? 'flex' : 'none';
    }

    function setSource(url) {
      if (!url) return;
      if (video.src !== url) {
        video.src = url;
      }
      video.load();
    }

    function playCurrent() {
      var p = video.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
      showOverlay(false);
    }

    function useMp4Fallback() {
      if (fallbackMp4) {
        currentPhase = 'mp4';
        setSource(fallbackMp4);
        video.addEventListener('loadedmetadata', playCurrent, { once: true });
        video.addEventListener('error', function () { showOverlay(true); }, { once: true });
        return true;
      }
      return false;
    }

    function useM3u8Fallback() {
      if (fallbackM3u8) {
        currentPhase = 'local-m3u8';
        setSource(fallbackM3u8);
        video.addEventListener('loadedmetadata', playCurrent, { once: true });
        video.addEventListener('error', function () {
          useMp4Fallback() || showOverlay(true);
        }, { once: true });
        return true;
      }
      return false;
    }

    function fallback() {
      if (currentPhase === 'primary') {
        if (useM3u8Fallback()) return;
        if (useMp4Fallback()) return;
      }
      if (currentPhase === 'local-m3u8') {
        if (useMp4Fallback()) return;
      }
      showOverlay(true);
    }

    function initSource(url) {
      if (!url) {
        fallback();
        return;
      }
      if (/\.m3u8($|\?)/i.test(url)) {
        if (window.Hls && Hls.isSupported()) {
          try {
            var hls = new Hls({
              maxBufferLength: 30,
              capLevelToPlayerSize: true,
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              playCurrent();
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                try { hls.destroy(); } catch (e) {}
                fallback();
              }
            });
            return;
          } catch (e) {
            fallback();
            return;
          }
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          currentPhase = 'native-m3u8';
          setSource(url);
          video.addEventListener('loadedmetadata', playCurrent, { once: true });
          video.addEventListener('error', fallback, { once: true });
          return;
        }
        fallback();
        return;
      }
      currentPhase = 'mp4-direct';
      setSource(url);
      video.addEventListener('loadedmetadata', playCurrent, { once: true });
      video.addEventListener('error', fallback, { once: true });
    }

    function start() {
      initSource(source);
    }

    if (overlay) {
      overlay.addEventListener('click', function (ev) {
        ev.preventDefault();
        start();
        setTimeout(function () {
          playCurrent();
        }, 120);
      });
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        if (!video.src) start();
        playCurrent();
      }
    });
    video.addEventListener('error', fallback);
  }

  document.addEventListener('DOMContentLoaded', function () {
    qa(document, '[data-search-input]').forEach(function (scopeInput) {
      initSearchScope(scopeInput.closest('main') || document);
    });
    qa(document, '[data-player]').forEach(playWithSource);

    var path = location.pathname.replace(/\\/g, '/');
    qa(document, 'nav a').forEach(function (a) {
      if (a.getAttribute('href') && path.endsWith(a.getAttribute('href'))) {
        a.classList.add('!bg-white', '!text-slate-950');
      }
    });
  });
})();
