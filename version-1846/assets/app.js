(function () {
    const menuButton = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');
    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-backdrop'));
        const thumbs = Array.from(hero.querySelectorAll('.hero-thumb'));
        const poster = hero.querySelector('[data-hero-poster]');
        const title = hero.querySelector('[data-hero-title]');
        const text = hero.querySelector('[data-hero-text]');
        const link = hero.querySelector('[data-hero-link]');
        let active = 0;

        function show(index) {
            active = index % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === active);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle('active', i === active);
            });
            const button = thumbs[active];
            if (button) {
                if (poster) poster.src = button.getAttribute('data-image');
                if (title) title.textContent = button.getAttribute('data-title');
                if (text) text.textContent = button.getAttribute('data-text');
                if (link) link.href = button.getAttribute('data-link');
            }
        }

        thumbs.forEach(function (thumb, index) {
            thumb.addEventListener('click', function () {
                show(index);
            });
        });

        if (slides.length) {
            show(0);
            setInterval(function () {
                show(active + 1);
            }, 5200);
        }
    }

    const filterInput = document.querySelector('[data-filter-input]');
    const yearSelect = document.querySelector('[data-filter-year]');
    const genreSelect = document.querySelector('[data-filter-genre]');
    const cards = Array.from(document.querySelectorAll('[data-title]'));
    const emptyState = document.querySelector('[data-empty-state]');

    function applyFilters() {
        const keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        const year = yearSelect ? yearSelect.value : '';
        const genre = genreSelect ? genreSelect.value : '';
        let visible = 0;

        cards.forEach(function (card) {
            const title = (card.getAttribute('data-title') || '').toLowerCase();
            const cardYear = card.getAttribute('data-year') || '';
            const cardGenre = card.getAttribute('data-genre') || '';
            const cardRegion = card.getAttribute('data-region') || '';
            const text = title + ' ' + cardGenre.toLowerCase() + ' ' + cardRegion.toLowerCase();
            const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
            const matchYear = !year || cardYear === year;
            const matchGenre = !genre || cardGenre.indexOf(genre) !== -1;
            const matched = matchKeyword && matchYear && matchGenre;
            card.style.display = matched ? '' : 'none';
            if (matched) visible += 1;
        });

        if (emptyState) {
            emptyState.style.display = visible ? 'none' : 'block';
        }
    }

    [filterInput, yearSelect, genreSelect].forEach(function (el) {
        if (el) {
            el.addEventListener('input', applyFilters);
            el.addEventListener('change', applyFilters);
        }
    });
})();
