import { H as Hls } from "./hls-vendor-dru42stk.js";

document.addEventListener("DOMContentLoaded", function () {
    var player = document.querySelector("[data-player]");
    if (!player) {
        return;
    }

    var video = player.querySelector("video");
    var overlay = player.querySelector("[data-play-overlay]");
    var status = document.querySelector("[data-player-status]");
    var source = player.dataset.videoUrl;
    var hls = null;

    function setStatus(message) {
        if (status) {
            status.textContent = message || "";
        }
    }

    function bindSource() {
        if (!video || !source) {
            return Promise.reject(new Error("missing-video"));
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (video.src !== source) {
                video.src = source;
            }
            return Promise.resolve();
        }

        if (Hls && Hls.isSupported()) {
            if (!hls) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.attachMedia(video);
                hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                    hls.loadSource(source);
                });
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus("播放暂时不可用，请稍后重试");
                    }
                });
            }
            return Promise.resolve();
        }

        video.src = source;
        return Promise.resolve();
    }

    function startPlayback() {
        bindSource()
            .then(function () {
                if (overlay) {
                    overlay.hidden = true;
                }
                setStatus("正在加载播放内容…");
                return video.play();
            })
            .then(function () {
                setStatus("");
            })
            .catch(function () {
                if (overlay) {
                    overlay.hidden = false;
                }
                setStatus("点击播放按钮开始播放");
            });
    }

    if (overlay) {
        overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.hidden = true;
        }
    });

    video.addEventListener("pause", function () {
        if (!video.ended && overlay) {
            overlay.hidden = false;
        }
    });

    video.addEventListener("loadedmetadata", function () {
        setStatus("");
    });
});
