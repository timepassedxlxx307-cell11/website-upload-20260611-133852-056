function setupPlayer(videoId, streamUrl, coverId) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var ready = false;
  var hls = null;

  if (!video || !streamUrl) {
    return;
  }

  function bindStream() {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      ready = true;
      return;
    }

    video.src = streamUrl;
    ready = true;
  }

  function playVideo() {
    bindStream();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function() {});
    }
  }

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function() {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function() {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  video.addEventListener('ended', function() {
    if (cover) {
      cover.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function() {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
