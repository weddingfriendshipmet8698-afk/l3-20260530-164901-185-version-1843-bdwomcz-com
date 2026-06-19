(function() {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function() {
            mobileNav.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
        if (!slides.length) {
            return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === index);
        });
    }

    function restart() {
        if (timer) {
            clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = setInterval(function() {
                showSlide(index + 1);
            }, 5600);
        }
    }

    dots.forEach(function(dot) {
        dot.addEventListener("click", function() {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            restart();
        });
    });

    if (prev) {
        prev.addEventListener("click", function() {
            showSlide(index - 1);
            restart();
        });
    }

    if (next) {
        next.addEventListener("click", function() {
            showSlide(index + 1);
            restart();
        });
    }

    restart();

    var searchInput = document.querySelector(".js-search-input");
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll(".js-filter-select"));
    var scope = document.querySelector(".js-card-scope");

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
        if (!scope) {
            return;
        }
        var keyword = normalize(searchInput ? searchInput.value : "");
        var filters = {};
        filterSelects.forEach(function(select) {
            filters[select.getAttribute("data-filter")] = normalize(select.value);
        });
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        cards.forEach(function(card) {
            var text = normalize((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || ""));
            var visible = !keyword || text.indexOf(keyword) !== -1;
            Object.keys(filters).forEach(function(key) {
                if (!filters[key]) {
                    return;
                }
                var value = normalize(card.getAttribute("data-" + key));
                if (value !== filters[key]) {
                    visible = false;
                }
            });
            card.classList.toggle("is-hidden", !visible);
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    filterSelects.forEach(function(select) {
        select.addEventListener("change", applyFilters);
    });
})();
