document.addEventListener("DOMContentLoaded", function () {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-menu-panel]");

    if (button && panel) {
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
        var target = form.getAttribute("data-target");
        var grid = document.getElementById(target);
        var empty = document.querySelector('[data-empty-for="' + target + '"]');

        if (!grid) {
            return;
        }

        var items = Array.prototype.slice.call(grid.querySelectorAll("[data-search-item]"));

        function value(name) {
            var field = form.elements[name];
            return field ? field.value.trim().toLowerCase() : "";
        }

        function applyFilter() {
            var keyword = value("keyword");
            var genre = value("genre");
            var region = value("region");
            var year = value("year");
            var visible = 0;

            items.forEach(function (item) {
                var haystack = [
                    item.getAttribute("data-title") || "",
                    item.getAttribute("data-region") || "",
                    item.getAttribute("data-year") || "",
                    item.getAttribute("data-genre") || "",
                    item.getAttribute("data-tags") || ""
                ].join(" ").toLowerCase();

                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (genre && (item.getAttribute("data-genre") || "").toLowerCase().indexOf(genre) === -1) {
                    matched = false;
                }

                if (region && (item.getAttribute("data-region") || "").toLowerCase() !== region) {
                    matched = false;
                }

                if (year && (item.getAttribute("data-year") || "").toLowerCase() !== year) {
                    matched = false;
                }

                item.classList.toggle("is-hidden", !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        form.addEventListener("input", applyFilter);
        form.addEventListener("change", applyFilter);
    });
});

function initMoviePlayer(src) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var start = document.querySelector("[data-player-start]");
    var ready = false;
    var hls = null;

    if (!video || !src) {
        return;
    }

    function prepare() {
        if (ready) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
        }

        ready = true;
    }

    function play() {
        prepare();
        video.controls = true;

        if (cover) {
            cover.classList.add("is-hidden");
        }

        video.play().catch(function () {});
    }

    if (cover) {
        cover.addEventListener("click", play);
    }

    if (start) {
        start.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
