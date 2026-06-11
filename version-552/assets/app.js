(function () {
    var ready = function (fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    };

    var escapeHtml = function (value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    };

    var openSearch = function (preset) {
        var panel = document.querySelector("[data-search-panel]");
        var input = document.querySelector("[data-global-search]");
        if (!panel || !input) {
            return;
        }
        panel.hidden = false;
        input.value = preset || input.value || "";
        input.focus();
        input.dispatchEvent(new Event("input"));
    };

    var closeSearch = function () {
        var panel = document.querySelector("[data-search-panel]");
        if (panel) {
            panel.hidden = true;
        }
    };

    ready(function () {
        var mobileButton = document.querySelector("[data-mobile-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (mobileButton && mobileNav) {
            mobileButton.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        document.querySelectorAll("[data-open-search]").forEach(function (button) {
            button.addEventListener("click", function () {
                openSearch("");
            });
        });

        document.querySelectorAll("[data-open-search-input]").forEach(function (input) {
            input.addEventListener("focus", function () {
                openSearch(input.value);
            });
            input.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    openSearch(input.value);
                }
            });
        });

        document.querySelectorAll("[data-close-search]").forEach(function (button) {
            button.addEventListener("click", closeSearch);
        });

        var panel = document.querySelector("[data-search-panel]");
        if (panel) {
            panel.addEventListener("click", function (event) {
                if (event.target === panel) {
                    closeSearch();
                }
            });
        }

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeSearch();
            }
        });

        var globalInput = document.querySelector("[data-global-search]");
        var results = document.querySelector("[data-search-results]");
        if (globalInput && results) {
            globalInput.addEventListener("input", function () {
                var query = globalInput.value.trim().toLowerCase();
                if (!query) {
                    results.innerHTML = "";
                    return;
                }
                var source = window.SEARCH_INDEX || [];
                var matches = source.filter(function (item) {
                    return item.text.toLowerCase().indexOf(query) !== -1;
                }).slice(0, 18);
                if (matches.length === 0) {
                    results.innerHTML = "<p>没有找到相关影片</p>";
                    return;
                }
                results.innerHTML = matches.map(function (item) {
                    return "<a class="search-result" href="./" + escapeHtml(item.file) + "">" +
                        "<img src="" + escapeHtml(item.cover) + "" alt="" + escapeHtml(item.title) + "">" +
                        "<span><strong>" + escapeHtml(item.title) + "</strong>" +
                        "<em>" + escapeHtml(item.year) + " · " + escapeHtml(item.region) + " · " + escapeHtml(item.genre) + "</em></span>" +
                        "</a>";
                }).join("");
            });
        }

        document.querySelectorAll("[data-filter-input]").forEach(function (input) {
            var section = input.closest(".section");
            var cards = section ? section.querySelectorAll("[data-card]") : [];
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
                    card.hidden = query && text.indexOf(query) === -1;
                });
            });
        });

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;
            var setSlide = function (index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            };
            var restart = function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    setSlide(current + 1);
                }, 5000);
            };
            if (prev) {
                prev.addEventListener("click", function () {
                    setSlide(current - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    setSlide(current + 1);
                    restart();
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    setSlide(index);
                    restart();
                });
            });
            setSlide(0);
            restart();
        });
    });

    window.initMoviePlayer = function (videoUrl, posterUrl) {
        ready(function () {
            var root = document.querySelector("[data-movie-player]");
            if (!root) {
                return;
            }
            var video = root.querySelector("video");
            var button = root.querySelector("[data-play-button]");
            var message = root.querySelector("[data-player-message]");
            var hls = null;
            var loaded = false;
            var showMessage = function (text) {
                if (message) {
                    message.textContent = text;
                    message.hidden = false;
                }
            };
            var playVideo = function () {
                var playPromise = video.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {
                        showMessage("请再次点击播放");
                    });
                }
            };
            var loadVideo = function () {
                if (loaded) {
                    playVideo();
                    return;
                }
                loaded = true;
                if (posterUrl) {
                    video.poster = posterUrl;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(videoUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                            return;
                        }
                        showMessage("播放暂时不可用");
                        hls.destroy();
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = videoUrl;
                    playVideo();
                } else {
                    showMessage("播放暂时不可用");
                }
            };
            if (button) {
                button.addEventListener("click", function () {
                    loadVideo();
                });
            }
            video.addEventListener("play", function () {
                root.classList.add("playing");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0) {
                    root.classList.remove("playing");
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    };
})();
