(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var hero = document.querySelector("[data-hero-slider]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var index = 0;

    function activateSlide(nextIndex) {
      index = nextIndex % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var nextIndex = Number(dot.getAttribute("data-slide") || 0);
        activateSlide(nextIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activateSlide(index + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector("[data-card-filter]");
  var cardList = document.querySelector("[data-card-list]");
  if (filterInput && cardList) {
    var cards = Array.prototype.slice.call(cardList.querySelectorAll(".movie-card"));
    var chipButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-key]"));
    var activeKey = "";

    function applyFilter() {
      var query = (filterInput.value || "").trim().toLowerCase();
      cards.forEach(function (card) {
        var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedKey = !activeKey || text.indexOf(activeKey.toLowerCase()) !== -1;
        card.style.display = matchedQuery && matchedKey ? "" : "none";
      });
    }

    filterInput.addEventListener("input", applyFilter);
    chipButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeKey = button.getAttribute("data-filter-key") || "";
        applyFilter();
      });
    });
  }

  var searchInput = document.getElementById("siteSearchInput");
  var searchButton = document.getElementById("siteSearchButton");
  var searchResults = document.getElementById("searchResults");

  function movieCardTemplate(movie) {
    return [
      '<article class="movie-card">',
      '  <a href="' + movie.url + '" class="poster-wrap">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'is-missing\')">',
      '    <span class="card-badge">' + escapeHtml(movie.category) + '</span>',
      '    <span class="poster-play">▶</span>',
      '    <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '      <span>' + escapeHtml(movie.genre) + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function runSearch() {
    if (!searchInput || !searchResults || !window.SEARCH_MOVIES) {
      return;
    }

    var query = (searchInput.value || "").trim().toLowerCase();
    var matches = window.SEARCH_MOVIES.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.category].join(" ").toLowerCase();
      return !query || text.indexOf(query) !== -1;
    }).slice(0, 80);

    searchResults.innerHTML = matches.map(movieCardTemplate).join("");
  }

  if (searchInput && searchButton && searchResults) {
    searchButton.addEventListener("click", runSearch);
    searchInput.addEventListener("input", runSearch);
    runSearch();
  }
}());
