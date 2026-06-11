(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play-button]");
      var status = document.querySelector(box.getAttribute("data-status-target") || "");
      var stream = box.getAttribute("data-stream");
      var hls = null;
      var loaded = false;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function loadStream() {
        if (!video || !stream || loaded) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 60
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放连接异常，请稍后重试");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          video.src = stream;
        }
        loaded = true;
      }

      function play() {
        loadStream();
        if (!video) {
          return;
        }
        video.controls = true;
        box.classList.add("is-playing");
        setStatus("正在加载影片");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.then(function () {
            setStatus("正在播放");
          }).catch(function () {
            box.classList.remove("is-playing");
            setStatus("点击播放按钮开始观看");
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
      }
    });
  });
})();
