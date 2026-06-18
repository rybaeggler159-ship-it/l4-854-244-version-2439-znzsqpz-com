(function () {
  var ready = function (callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  };

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var carousel = document.querySelector(".js-hero-carousel");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var prev = carousel.querySelector(".js-hero-prev");
      var next = carousel.querySelector(".js-hero-next");
      var current = 0;
      var timer = null;

      var setSlide = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      };

      var play = function () {
        timer = window.setInterval(function () {
          setSlide(current + 1);
        }, 5200);
      };

      var reset = function () {
        if (timer) {
          window.clearInterval(timer);
        }
        play();
      };

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          setSlide(index);
          reset();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          setSlide(current - 1);
          reset();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          setSlide(current + 1);
          reset();
        });
      }

      if (slides.length > 1) {
        play();
      }
    }

    var cardList = document.querySelector(".js-card-list");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".js-card"));
    var search = document.querySelector(".js-search-input");
    var year = document.querySelector(".js-year-filter");
    var type = document.querySelector(".js-type-filter");
    var region = document.querySelector(".js-region-filter");

    if (cardList && cards.length) {
      var filterCards = function () {
        var keyword = search ? search.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var regionValue = region ? region.value : "";

        cards.forEach(function (card) {
          var title = (card.dataset.title || "").toLowerCase();
          var genre = (card.dataset.genre || "").toLowerCase();
          var cardYear = card.dataset.year || "";
          var cardType = card.dataset.type || "";
          var cardRegion = card.dataset.region || "";
          var keywordHit = !keyword || title.indexOf(keyword) > -1 || genre.indexOf(keyword) > -1;
          var yearHit = !yearValue || cardYear === yearValue;
          var typeHit = !typeValue || cardType === typeValue;
          var regionHit = !regionValue || cardRegion === regionValue;
          card.classList.toggle("is-hidden", !(keywordHit && yearHit && typeHit && regionHit));
        });
      };

      [search, year, type, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", filterCards);
          control.addEventListener("change", filterCards);
        }
      });
    }

    var player = document.querySelector(".js-player-box");
    if (player) {
      var video = player.querySelector(".js-video");
      var button = player.querySelector(".js-play-button");
      var loaded = false;
      var stream = window.pageMovie && window.pageMovie.playUrl;

      var attachStream = function () {
        if (!video || !stream || loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return;
        }
        video.src = stream;
      };

      var start = function () {
        attachStream();
        if (button) {
          button.classList.add("is-hidden");
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      };

      if (button) {
        button.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", attachStream, { once: true });
        video.addEventListener("play", attachStream, { once: true });
      }
    }
  });
})();
