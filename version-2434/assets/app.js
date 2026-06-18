(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.nav-toggle');
    if (header && toggle) {
        toggle.addEventListener('click', function () {
            var opened = header.classList.toggle('nav-open');
            toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('image-missing');
        });
    });

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var prev = carousel.querySelector('[data-carousel-prev]');
        var next = carousel.querySelector('[data-carousel-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var to = Number(dot.getAttribute('data-slide-to') || 0);
                show(to);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            window.location.href = form.getAttribute('action') + (value ? '?q=' + encodeURIComponent(value) : '');
        });
    });

    document.querySelectorAll('.filter-page').forEach(function (page) {
        var searchForm = page.querySelector('[data-local-search]');
        var searchInput = searchForm ? searchForm.querySelector('input') : null;
        var chips = Array.prototype.slice.call(page.querySelectorAll('.filter-chip'));
        var cards = Array.prototype.slice.call(page.querySelectorAll('.movie-card'));
        var rows = Array.prototype.slice.call(page.querySelectorAll('.rank-row'));
        var params = new URLSearchParams(window.location.search);
        var currentFilter = '';

        function normalize(value) {
            return String(value || '').toLowerCase().replace(/\s+/g, '');
        }

        function contentOfCard(card) {
            return normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' '));
        }

        function apply() {
            var query = normalize(searchInput ? searchInput.value : '');
            var filter = normalize(currentFilter);
            cards.forEach(function (card) {
                var text = contentOfCard(card);
                var matched = (!query || text.indexOf(query) !== -1) && (!filter || text.indexOf(filter) !== -1);
                card.classList.toggle('is-hidden', !matched);
            });
            rows.forEach(function (row) {
                var text = normalize(row.textContent);
                var matched = (!query || text.indexOf(query) !== -1) && (!filter || text.indexOf(filter) !== -1);
                row.classList.toggle('is-hidden', !matched);
            });
        }

        if (searchInput && params.get('q')) {
            searchInput.value = params.get('q');
        }

        if (searchForm) {
            searchForm.addEventListener('submit', function (event) {
                event.preventDefault();
                apply();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', apply);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                currentFilter = chip.getAttribute('data-filter') || '';
                chips.forEach(function (item) {
                    item.classList.toggle('active', item === chip);
                });
                apply();
            });
        });

        apply();
    });

    var backTop = document.querySelector('.back-top');
    if (backTop) {
        window.addEventListener('scroll', function () {
            backTop.classList.toggle('show', window.scrollY > 360);
        }, { passive: true });

        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}());
