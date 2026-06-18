document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.querySelector("[data-search-input]");
    var resultWrap = document.querySelector("[data-search-results]");
    var count = document.querySelector("[data-search-count]");

    if (input) {
        input.value = query;
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function escapeText(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function render(value) {
        var normalized = normalize(value);
        var source = Array.isArray(window.MOVIE_SEARCH_INDEX) ? window.MOVIE_SEARCH_INDEX : [];
        var results = source.filter(function (movie) {
            if (!normalized) {
                return true;
            }
            return [
                movie.title,
                movie.region,
                movie.year,
                movie.type,
                movie.genre,
                movie.tags,
                movie.category,
                movie.oneLine
            ].join(" ").toLowerCase().indexOf(normalized) !== -1;
        }).slice(0, 240);

        if (count) {
            count.textContent = "找到 " + results.length + " 部相关内容";
        }

        if (!resultWrap) {
            return;
        }

        if (!results.length) {
            resultWrap.innerHTML = '<div class="empty-result" style="display:block">没有找到匹配内容，可以换一个关键词继续搜索。</div>';
            return;
        }

        resultWrap.innerHTML = results.map(function (movie) {
            return [
                '<article class="search-result-item">',
                '<a href="' + escapeText(movie.url) + '"><img src="' + escapeText(movie.cover) + '" alt="' + escapeText(movie.title) + '" loading="lazy"></a>',
                '<div>',
                '<h2><a href="' + escapeText(movie.url) + '">' + escapeText(movie.title) + '</a></h2>',
                '<p>' + escapeText(movie.oneLine) + '</p>',
                '<div class="movie-meta"><span>' + escapeText(movie.year) + '</span><span>' + escapeText(movie.region) + '</span><span>' + escapeText(movie.category) + '</span></div>',
                '</div>',
                '</article>'
            ].join("");
        }).join("");
    }

    render(query);

    if (input) {
        input.addEventListener("input", function () {
            render(input.value);
        });
    }
});
