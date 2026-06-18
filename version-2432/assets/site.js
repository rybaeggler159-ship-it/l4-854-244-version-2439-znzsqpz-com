(function() {
    var menuButton = document.querySelector('.menu-button');
    var mobileNav = document.querySelector('.mobile-nav');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    dots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function() {
            showSlide(current + 1);
        }, 5200);
    }

    var forms = Array.prototype.slice.call(document.querySelectorAll('.search-panel'));
    var activeFilters = {};

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applySearch(query) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var q = normalize(query);
        cards.forEach(function(card) {
            var text = normalize(card.getAttribute('data-search-text'));
            var matchedText = !q || text.indexOf(q) !== -1;
            var matchedFilters = Object.keys(activeFilters).every(function(key) {
                return normalize(card.getAttribute('data-' + key)) === normalize(activeFilters[key]);
            });
            card.classList.toggle('is-hidden', !(matchedText && matchedFilters));
        });
    }

    forms.forEach(function(form) {
        var input = form.querySelector('[data-search-input]');
        if (!input) {
            return;
        }
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            var query = input.value.trim();
            if (form.getAttribute('data-search-mode') === 'global') {
                if (query) {
                    window.location.href = './movies.html?q=' + encodeURIComponent(query);
                } else {
                    window.location.href = './movies.html';
                }
                return;
            }
            applySearch(query);
        });
        input.addEventListener('input', function() {
            if (form.getAttribute('data-search-mode') !== 'global') {
                applySearch(input.value);
            }
        });
    });

    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-key], [data-filter-clear]'));
    chips.forEach(function(chip) {
        chip.addEventListener('click', function() {
            if (chip.hasAttribute('data-filter-clear')) {
                activeFilters = {};
                chips.forEach(function(item) {
                    item.classList.toggle('active', item.hasAttribute('data-filter-clear'));
                });
            } else {
                var key = chip.getAttribute('data-filter-key');
                var value = chip.getAttribute('data-filter-value');
                activeFilters = {};
                activeFilters[key] = value;
                chips.forEach(function(item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
            }
            var input = document.querySelector('[data-search-input]');
            applySearch(input ? input.value : '');
        });
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
        var pageInput = document.querySelector('[data-search-input]');
        if (pageInput) {
            pageInput.value = query;
            applySearch(query);
        }
    }
}());
