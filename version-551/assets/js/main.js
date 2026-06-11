(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initMobileMenu() {
        var button = document.querySelector('.mobile-menu-button');
        var nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var opened = nav.classList.toggle('open');
            button.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer;
        function activate(index) {
            current = index % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5500);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                activate(index);
                start();
            });
        });
        start();
    }

    function initSearchForms() {
        selectAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"], input[type="search"]');
                var query = input ? input.value.trim() : '';
                var url = './search.html';
                if (query) {
                    url += '?q=' + encodeURIComponent(query);
                }
                window.location.href = url;
            });
        });
    }

    function initFilters() {
        selectAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var typeSelect = scope.querySelector('[data-type-filter]');
            var regionSelect = scope.querySelector('[data-region-filter]');
            var cards = selectAll('[data-movie-card]', scope);
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q');
            if (initialQuery && input) {
                input.value = initialQuery;
            }
            function apply() {
                var query = normalize(input && input.value);
                var type = normalize(typeSelect && typeSelect.value);
                var region = normalize(regionSelect && regionSelect.value);
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type')
                    ].join(' '));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var matched = true;
                    if (query && haystack.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (type && cardType.indexOf(type) === -1) {
                        matched = false;
                    }
                    if (region && cardRegion.indexOf(region) === -1) {
                        matched = false;
                    }
                    card.classList.toggle('hidden-by-filter', !matched);
                });
            }
            [input, typeSelect, regionSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function initPlayers() {
        selectAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.player-button');
            var status = player.querySelector('.player-status');
            var stream = player.getAttribute('data-stream');
            var hlsInstance = null;
            if (!video || !stream) {
                return;
            }
            function showStatus(message) {
                if (!status) {
                    return;
                }
                status.textContent = message;
                status.classList.add('show');
                window.setTimeout(function () {
                    status.classList.remove('show');
                }, 2800);
            }
            function attachStream() {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal) {
                            showStatus('视频加载失败，请刷新后重试');
                        }
                    });
                    return;
                }
                video.src = stream;
            }
            function playVideo() {
                var promise = video.play();
                if (promise && typeof promise.then === 'function') {
                    promise.then(function () {
                        player.classList.add('is-playing');
                    }).catch(function () {
                        showStatus('请再次点击播放');
                    });
                } else {
                    player.classList.add('is-playing');
                }
            }
            attachStream();
            if (button) {
                button.addEventListener('click', playVideo);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                    player.classList.remove('is-playing');
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                player.classList.remove('is-playing');
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initSearchForms();
        initFilters();
        initPlayers();
    });
}());
