(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var nextButton = hero.querySelector('[data-hero-next]');
    var prevButton = hero.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      slides[index].classList.remove('is-active');
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add('is-active');
    }

    function startAuto() {
      timer = window.setInterval(function() {
        showSlide(index + 1);
      }, 5200);
    }

    function restartAuto() {
      if (timer) {
        window.clearInterval(timer);
      }
      startAuto();
    }

    if (nextButton) {
      nextButton.addEventListener('click', function() {
        showSlide(index + 1);
        restartAuto();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function() {
        showSlide(index - 1);
        restartAuto();
      });
    }

    startAuto();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]')).forEach(function(form) {
    var scope = form.closest('main') || document;
    var input = form.querySelector('[data-search-input]');
    var yearSelect = form.querySelector('[data-year-filter]');
    var typeSelect = form.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var visible = 0;

      cards.forEach(function(card) {
        var haystack = normalize(card.getAttribute('data-title'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }
  });
})();
