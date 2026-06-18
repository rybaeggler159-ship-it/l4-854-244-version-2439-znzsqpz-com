(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    var start = function () {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    var restart = function () {
      window.clearInterval(timer);
      start();
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  var scope = document.querySelector('[data-filter-scope]');

  if (scope) {
    var keywordInput = document.querySelector('[data-filter-keyword]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var categorySelect = document.querySelector('[data-filter-category]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var clearButton = document.querySelector('[data-filter-clear]');
    var empty = document.querySelector('[data-filter-empty]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (keywordInput && initialQuery) {
      keywordInput.value = initialQuery;
    }

    var normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    var applyFilters = function () {
      var keyword = normalize(keywordInput ? keywordInput.value : '');
      var region = normalize(regionSelect ? regionSelect.value : '');
      var category = normalize(categorySelect ? categorySelect.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var items = Array.prototype.slice.call(scope.children);
      var visible = 0;

      items.forEach(function (item) {
        var haystack = normalize([
          item.getAttribute('data-title'),
          item.getAttribute('data-region'),
          item.getAttribute('data-type'),
          item.getAttribute('data-category'),
          item.getAttribute('data-year'),
          item.getAttribute('data-tags'),
          item.textContent
        ].join(' '));

        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchRegion = !region || normalize(item.getAttribute('data-region')) === region;
        var matchCategory = !category || normalize(item.getAttribute('data-category')) === category;
        var matchYear = !year || normalize(item.getAttribute('data-year')) === year;
        var matched = matchKeyword && matchRegion && matchCategory && matchYear;

        item.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    };

    [keywordInput, regionSelect, categorySelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (categorySelect) {
          categorySelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        applyFilters();
      });
    }

    applyFilters();
  }
})();
