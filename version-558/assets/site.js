(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (menuButton && nav) {
      menuButton.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-slide-dot]"));
    var prev = document.querySelector("[data-slide-prev]");
    var next = document.querySelector("[data-slide-next]");
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    if (slides.length) {
      showSlide(0);
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(document.querySelectorAll(panel.getAttribute("data-filter-panel")));
      var empty = document.querySelector(panel.getAttribute("data-empty-target") || "");

      function matches(card) {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-genre") || ""
        ].join(" ").toLowerCase();
        var keywordOk = !keyword || text.indexOf(keyword) !== -1;
        var yearOk = !yearValue || (card.getAttribute("data-year") || "") === yearValue;
        var typeOk = !typeValue || (card.getAttribute("data-type") || "").indexOf(typeValue) !== -1;
        return keywordOk && yearOk && typeOk;
      }

      function filter() {
        var visible = 0;
        cards.forEach(function (card) {
          var ok = matches(card);
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", filter);
          control.addEventListener("change", filter);
        }
      });
    });
  });
})();
