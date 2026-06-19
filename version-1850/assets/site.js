
(function(){
  const onReady = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();
  onReady(() => {
    document.querySelectorAll('[data-nav-toggle]').forEach(btn => {
      const panel = document.querySelector('[data-nav-panel]');
      btn.addEventListener('click', () => panel.classList.toggle('is-open'));
    });
    document.querySelectorAll('[data-filter-form]').forEach(form => {
      const cards = Array.from(document.querySelectorAll('[data-filter-card]'));
      const q = form.querySelector('[data-q]');
      const typeSel = form.querySelector('[data-type]');
      const regionSel = form.querySelector('[data-region]');
      const yearSel = form.querySelector('[data-year]');
      const count = form.querySelector('[data-result-count]');
      const apply = () => {
        const term = (q?.value || '').trim().toLowerCase();
        const type = (typeSel?.value || '').trim();
        const region = (regionSel?.value || '').trim();
        const year = (yearSel?.value || '').trim();
        let shown = 0;
        cards.forEach(card => {
          const hay = (card.dataset.keywords || '').toLowerCase();
          const ok = (!term || hay.includes(term)) && (!type || card.dataset.type === type) && (!region || card.dataset.region === region) && (!year || card.dataset.year === year);
          card.classList.toggle('hidden', !ok);
          if (ok) shown += 1;
        });
        if (count) count.textContent = shown + ' 条可见';
      };
      [q, typeSel, regionSel, yearSel].forEach(el => el && el.addEventListener('input', apply));
      form.addEventListener('reset', () => setTimeout(apply, 0));
      apply();
    });
    document.querySelectorAll('[data-scroll-track]').forEach(track => {
      let timer = null;
      const step = () => {
        const first = track.querySelector('.hero-mini, .movie-card');
        const width = first ? first.getBoundingClientRect().width + 12 : 280;
        const max = track.scrollWidth - track.clientWidth;
        const next = track.scrollLeft + width;
        track.scrollTo({ left: next >= max - 6 ? 0 : next, behavior: 'smooth' });
      };
      const start = () => { if (!timer) timer = setInterval(step, 4800); };
      const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
      start();
      track.addEventListener('mouseenter', stop);
      track.addEventListener('mouseleave', start);
    });
    document.querySelectorAll('[data-player]').forEach(box => {
      const video = box.querySelector('video');
      const overlay = box.querySelector('[data-play-overlay]');
      const btn = box.querySelector('[data-play-demo]');
      const src = box.dataset.playSrc || box.dataset.demoSrc || './assets/demo/preview.m3u8';
      let hls = null;
      const ensure = () => {
        if (video.dataset.loaded === src) return;
        if (hls) { try { hls.destroy(); } catch(e) {} hls = null; }
        video.dataset.loaded = src;
        if (window.Hls && Hls.isSupported() && src.endsWith('.m3u8')) {
          hls = new Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      };
      const play = async () => {
        ensure();
        overlay?.classList.add('hidden');
        try { await video.play(); } catch(e) {}
      };
      btn?.addEventListener('click', play);
      overlay?.addEventListener('click', play);
    });
  });
})();
