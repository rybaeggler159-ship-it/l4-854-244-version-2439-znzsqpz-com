(function () {
  var root = document.querySelector('[data-filter-page]');

  if (!root) {
    return;
  }

  var input = root.querySelector('[data-filter-input]');
  var regionSelect = root.querySelector('[data-filter-region]');
  var typeSelect = root.querySelector('[data-filter-type]');
  var yearSelect = root.querySelector('[data-filter-year]');
  var count = root.querySelector('[data-filter-count]');
  var empty = root.querySelector('[data-empty-state]');
  var items = Array.prototype.slice.call(root.querySelectorAll('[data-filter-item]'));

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilter() {
    var keyword = normalize(input && input.value);
    var region = regionSelect ? regionSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    var visible = 0;

    items.forEach(function (item) {
      var text = normalize(item.getAttribute('data-search-text'));
      var itemRegion = item.getAttribute('data-region-group') || '';
      var itemType = item.getAttribute('data-type-group') || '';
      var itemYear = item.getAttribute('data-year') || '';
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }

      if (region && region !== itemRegion) {
        matched = false;
      }

      if (type && type !== itemType) {
        matched = false;
      }

      if (year && year !== itemYear) {
        matched = false;
      }

      item.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = '当前显示 ' + visible + ' 部';
    }

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  if (query && input) {
    input.value = query;
  }

  [input, regionSelect, typeSelect, yearSelect].forEach(function (control) {
    if (!control) {
      return;
    }

    control.addEventListener('input', applyFilter);
    control.addEventListener('change', applyFilter);
  });

  applyFilter();
}());
