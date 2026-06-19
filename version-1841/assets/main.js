document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobileNav.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var previous = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === current);
        });
    }

    function startTimer() {
        if (timer) {
            window.clearInterval(timer);
        }

        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-slide")) || 0);
            startTimer();
        });
    });

    if (previous) {
        previous.addEventListener("click", function () {
            showSlide(current - 1);
            startTimer();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(current + 1);
            startTimer();
        });
    }

    startTimer();

    var searchInput = document.querySelector(".search-input");
    var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function filterCards() {
        var query = normalize(searchInput ? searchInput.value : "");
        var activeFilters = selects.map(function (select) {
            return {
                key: select.getAttribute("data-filter-key"),
                value: normalize(select.value)
            };
        });

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search") || card.textContent);
            var matchedText = !query || text.indexOf(query) !== -1;
            var matchedFilters = activeFilters.every(function (filter) {
                if (!filter.value) {
                    return true;
                }

                return normalize(card.getAttribute("data-" + filter.key)) === filter.value;
            });

            card.style.display = matchedText && matchedFilters ? "" : "none";
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterCards);
    }

    selects.forEach(function (select) {
        select.addEventListener("change", filterCards);
    });
});
