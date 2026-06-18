(function () {
    function startPlayer(card) {
        var video = card.querySelector('video');
        var overlay = card.querySelector('.play-overlay');
        if (!video || card.getAttribute('data-started') === 'true') {
            return;
        }
        var source = video.getAttribute('data-src');
        if (!source) {
            return;
        }
        card.setAttribute('data-started', 'true');
        card.classList.add('is-playing');
        video.controls = true;
        video.muted = false;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.play().catch(function () {
                card.classList.remove('is-playing');
                card.setAttribute('data-started', 'false');
            });
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {
                    card.classList.remove('is-playing');
                    card.setAttribute('data-started', 'false');
                });
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                }
            });
            return;
        }

        video.src = source;
        video.play().catch(function () {
            card.classList.remove('is-playing');
            card.setAttribute('data-started', 'false');
        });
    }

    document.querySelectorAll('[data-player]').forEach(function (card) {
        var video = card.querySelector('video');
        var overlay = card.querySelector('.play-overlay');
        if (overlay) {
            overlay.addEventListener('click', function () {
                startPlayer(card);
            });
        }
        if (video) {
            video.addEventListener('click', function () {
                if (card.getAttribute('data-started') !== 'true') {
                    startPlayer(card);
                }
            });
        }
    });
}());
