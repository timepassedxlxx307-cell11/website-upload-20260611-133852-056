(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
    var searchInput = scope.querySelector('[data-search-input]');
    var regionSelect = scope.querySelector('[data-filter="region"]');
    var typeSelect = scope.querySelector('[data-filter="type"]');
    var yearSelect = scope.querySelector('[data-filter="year"]');
    var sortSelect = scope.querySelector('[data-sort]');
    var grid = scope.querySelector('[data-card-grid]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && searchInput) {
      searchInput.value = query;
    }

    function textValue(card) {
      return [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-tags') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
    }

    function cardYear(card) {
      var year = card.getAttribute('data-year') || '';
      var match = year.match(/\d{4}/);
      return match ? parseInt(match[0], 10) : 0;
    }

    function applyFilter() {
      var needle = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        var matchesText = !needle || textValue(card).indexOf(needle) !== -1;
        var matchesRegion = !region || (card.getAttribute('data-region') || '') === region;
        var matchesType = !type || (card.getAttribute('data-type') || '') === type;
        var matchesYear = !year || (card.getAttribute('data-year') || '') === year;
        card.classList.toggle('is-hidden', !(matchesText && matchesRegion && matchesType && matchesYear));
      });
    }

    function applySort() {
      var value = sortSelect ? sortSelect.value : 'default';
      var sorted = cards.slice();

      if (value === 'year-desc') {
        sorted.sort(function (a, b) {
          return cardYear(b) - cardYear(a);
        });
      }

      if (value === 'year-asc') {
        sorted.sort(function (a, b) {
          return cardYear(a) - cardYear(b);
        });
      }

      if (value === 'title') {
        sorted.sort(function (a, b) {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
        });
      }

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        applySort();
        applyFilter();
      });
    }

    applySort();
    applyFilter();
  });
})();

function bindPlayer(options) {
  var video = document.getElementById(options.video);
  var overlay = document.getElementById(options.overlay);
  var url = options.url;
  var hls = null;
  var attached = false;

  if (!video || !url) {
    return;
  }

  function attachVideo() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = url;
  }

  function playVideo() {
    attachVideo();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    video.play().catch(function () {});
  }

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });
}
