document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-primary-nav]");
    var search = document.querySelector(".site-search");

    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            if (search) {
                search.classList.toggle("is-open");
            }
        });
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        var input = scope.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
        var count = scope.querySelector("[data-result-count]");
        var empty = scope.querySelector("[data-empty-result]");
        var filters = {};

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function cardText(card) {
            return [
                card.dataset.title,
                card.dataset.region,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.type,
                card.dataset.tags
            ].join(" ").toLowerCase();
        }

        function applyFilters() {
            var query = input ? normalize(input.value) : "";
            var visible = 0;

            cards.forEach(function (card) {
                var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
                var matchesGroups = Object.keys(filters).every(function (key) {
                    if (!filters[key] || filters[key] === "all") {
                        return true;
                    }
                    return normalize(card.dataset[key]).indexOf(normalize(filters[key])) !== -1;
                });
                var isVisible = matchesQuery && matchesGroups;
                card.style.display = isVisible ? "" : "none";
                if (isVisible) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = "当前显示 " + visible + " 部";
            }
            if (empty) {
                empty.style.display = visible === 0 ? "block" : "none";
            }
        }

        if (input) {
            input.addEventListener("input", applyFilters);
        }

        scope.querySelectorAll("[data-filter-group]").forEach(function (button) {
            button.addEventListener("click", function () {
                var group = button.dataset.filterGroup;
                var value = button.dataset.filterValue || "all";
                filters[group] = value;

                scope.querySelectorAll("[data-filter-group='" + group + "']").forEach(function (peer) {
                    peer.classList.toggle("is-active", peer === button);
                });

                applyFilters();
            });
        });

        applyFilters();
    });
});
