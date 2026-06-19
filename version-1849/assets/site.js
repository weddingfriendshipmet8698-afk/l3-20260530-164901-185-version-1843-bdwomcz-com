import { H as Hls } from './hls-vendor-dru42stk.js';

const menuButton = document.querySelector('[data-menu-button]');
const mobilePanel = document.querySelector('[data-mobile-panel]');

if (menuButton && mobilePanel) {
  menuButton.addEventListener('click', () => {
    mobilePanel.classList.toggle('open');
  });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  let current = 0;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
  });

  if (slides.length > 1) {
    window.setInterval(() => showSlide(current + 1), 5200);
  }
}

function getSearchableText(card) {
  return [
    card.dataset.title,
    card.dataset.year,
    card.dataset.genre,
    card.textContent
  ].join(' ').toLowerCase();
}

function bindSearch(input) {
  const section = input.closest('section') || document;
  const cards = Array.from(document.querySelectorAll('.movie-card'));

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    cards.forEach((card) => {
      const match = !query || getSearchableText(card).includes(query);
      card.classList.toggle('hidden-by-filter', !match);
    });
  });
}

document.querySelectorAll('[data-card-search]').forEach(bindSearch);

function sortCards(compare) {
  const grid = document.querySelector('.movie-grid');
  if (!grid) {
    return;
  }
  const cards = Array.from(grid.querySelectorAll('.movie-card'));
  cards.sort(compare).forEach((card) => grid.appendChild(card));
}

document.querySelectorAll('[data-sort-year]').forEach((button) => {
  button.addEventListener('click', () => {
    sortCards((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
  });
});

document.querySelectorAll('[data-sort-score]').forEach((button) => {
  button.addEventListener('click', () => {
    sortCards((a, b) => Number(b.dataset.score || 0) - Number(a.dataset.score || 0));
  });
});

function attachHls(video, source) {
  if (!source) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    return;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    video._hls = hls;
    return;
  }

  video.src = source;
}

document.querySelectorAll('[data-player-shell]').forEach((shell) => {
  const video = shell.querySelector('video[data-src]');
  const button = shell.querySelector('[data-play-button]');

  async function startVideo() {
    if (!video) {
      return;
    }

    if (!video.dataset.ready) {
      attachHls(video, video.dataset.src);
      video.dataset.ready = 'true';
    }

    shell.classList.add('playing');

    try {
      await video.play();
    } catch (error) {
      shell.classList.remove('playing');
    }
  }

  if (button) {
    button.addEventListener('click', startVideo);
  }

  if (video) {
    video.addEventListener('click', () => {
      if (video.paused) {
        startVideo();
      }
    });
    video.addEventListener('play', () => shell.classList.add('playing'));
    video.addEventListener('pause', () => {
      if (!video.seeking && video.currentTime === 0) {
        shell.classList.remove('playing');
      }
    });
  }
});
