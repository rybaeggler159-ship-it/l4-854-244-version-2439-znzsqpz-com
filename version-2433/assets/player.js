(function () {
  var Hls = window.Hls;
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  function setError(wrapper, message) {
    var errorBox = wrapper.querySelector('[data-player-error]');
    if (!errorBox) {
      return;
    }

    errorBox.textContent = message;
    errorBox.classList.add('is-visible');
  }

  function clearError(wrapper) {
    var errorBox = wrapper.querySelector('[data-player-error]');
    if (!errorBox) {
      return;
    }

    errorBox.textContent = '';
    errorBox.classList.remove('is-visible');
  }

  players.forEach(function (wrapper) {
    var video = wrapper.querySelector('video');
    var playButtons = Array.prototype.slice.call(wrapper.querySelectorAll('[data-player-toggle]'));
    var muteButton = wrapper.querySelector('[data-player-mute]');
    var fullscreenButton = wrapper.querySelector('[data-player-fullscreen]');
    var source = video ? video.getAttribute('data-hls') : '';
    var hlsInstance = null;
    var initialized = false;

    if (!video || !source) {
      setError(wrapper, '未找到可播放的视频源。');
      return;
    }

    function initialize() {
      if (initialized) {
        return;
      }
      initialized = true;
      clearError(wrapper);

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.ERROR, function (_event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setError(wrapper, '网络加载异常，正在尝试重新连接视频源。');
            hlsInstance.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            setError(wrapper, '媒体解析异常，正在尝试恢复播放。');
            hlsInstance.recoverMediaError();
          } else {
            setError(wrapper, '当前浏览器无法播放该视频，请稍后重试。');
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        setError(wrapper, '当前浏览器不支持 HLS 播放，请使用新版 Chrome、Edge、Safari 或 Firefox。');
      }
    }

    function updatePlayState() {
      wrapper.classList.toggle('is-playing', !video.paused && !video.ended);
      playButtons.forEach(function (button) {
        button.setAttribute('aria-label', video.paused ? '播放影片' : '暂停影片');
        if (button.hasAttribute('data-toolbar-label')) {
          button.textContent = video.paused ? '播放' : '暂停';
        }
      });
    }

    playButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        initialize();
        if (video.paused) {
          video.play().catch(function () {
            setError(wrapper, '播放被浏览器拦截，请再次点击播放按钮。');
          });
        } else {
          video.pause();
        }
      });
    });

    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (wrapper.requestFullscreen) {
          wrapper.requestFullscreen();
        }
      });
    }

    video.addEventListener('play', updatePlayState);
    video.addEventListener('pause', updatePlayState);
    video.addEventListener('ended', updatePlayState);
    video.addEventListener('error', function () {
      setError(wrapper, '视频播放失败，请检查网络后重试。');
    });

    updatePlayState();
  });
}());
