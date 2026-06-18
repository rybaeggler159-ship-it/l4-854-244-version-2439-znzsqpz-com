(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-trigger]');
    var hls = null;
    var initialized = false;

    var initialize = function () {
      if (!video || initialized) {
        return;
      }

      initialized = true;
      var stream = video.getAttribute('data-stream');

      if (!stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      player.classList.add('ready');
    };

    var play = function () {
      initialize();

      if (!video) {
        return;
      }

      var request = video.play();

      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    };

    if (button) {
      button.addEventListener('click', function () {
        player.classList.add('is-playing');
        play();
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });

      video.addEventListener('click', function () {
        if (!initialized) {
          play();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
