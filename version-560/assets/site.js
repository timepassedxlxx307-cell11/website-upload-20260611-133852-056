(function () {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var searchInput = scope.querySelector('[data-filter-search]');
    var typeSelect = scope.querySelector('[data-filter-type]');
    var sortSelect = scope.querySelector('[data-filter-sort]');
    var list = scope.querySelector('[data-card-list]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var type = typeSelect ? typeSelect.value : 'all';
      var sort = sortSelect ? sortSelect.value : 'views';
      var visibleCards = cards.slice();

      visibleCards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = type === 'all' || card.getAttribute('data-type') === type;
        card.classList.toggle('is-filtered-out', !(matchesQuery && matchesType));
      });

      visibleCards.sort(function (a, b) {
        if (sort === 'rating') {
          return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
        }
        if (sort === 'year') {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        }
        return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
      });

      visibleCards.forEach(function (card) {
        list.appendChild(card);
      });
    }

    if (scope.hasAttribute('data-query-search') && searchInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        searchInput.value = query;
      }
    }

    [searchInput, typeSelect, sortSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  });

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var source = shell.getAttribute('data-video-url');
    var hlsInstance = null;
    var initialized = false;

    if (!video || !button || !source) {
      return;
    }

    function attachSource() {
      if (initialized) {
        return;
      }
      initialized = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function start() {
      attachSource();
      video.controls = true;
      button.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('ended', function () {
      button.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
