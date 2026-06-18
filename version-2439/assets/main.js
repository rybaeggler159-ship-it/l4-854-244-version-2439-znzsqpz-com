(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var active = 0;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }

        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });

      if (slides.length > 1) {
        setInterval(function () {
          showSlide(active + 1);
        }, 6500);
      }
    }

    var queryParams = new URLSearchParams(window.location.search);
    var query = (queryParams.get("q") || "").trim().toLowerCase();
    var searchInputs = document.querySelectorAll("[data-search-input], [data-local-search]");

    searchInputs.forEach(function (input) {
      if (query && !input.value) {
        input.value = query;
      }
    });

    var filterLists = document.querySelectorAll("[data-filter-list]");

    function applyFilter(root, value) {
      var cards = root.querySelectorAll(".movie-card");
      var normalized = (value || "").trim().toLowerCase();

      cards.forEach(function (card) {
        var text = card.getAttribute("data-filter-text") || "";
        card.classList.toggle("is-filtered-out", normalized && text.indexOf(normalized) === -1);
      });
    }

    filterLists.forEach(function (root) {
      var localInput = document.querySelector("[data-local-search]");
      var initialValue = root.hasAttribute("data-query-filter") ? query : "";

      if (initialValue) {
        applyFilter(root, initialValue);
      }

      if (localInput) {
        localInput.addEventListener("input", function () {
          applyFilter(root, localInput.value);
        });
      }

      var chips = document.querySelectorAll("[data-filter-chip]");
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          var value = chip.getAttribute("data-filter-chip") || "";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          if (localInput) {
            localInput.value = value;
          }
          applyFilter(root, value);
        });
      });
    });
  });

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playerOverlay");

    if (!video || !overlay || !source) {
      return;
    }

    var started = false;
    var hls = null;

    function attachSource() {
      if (started) {
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      attachSource();
      overlay.classList.add("is-hidden");
      video.controls = true;
      video.play().catch(function () {});
    }

    overlay.addEventListener("click", startPlayback);

    video.addEventListener("click", function () {
      if (!started) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
