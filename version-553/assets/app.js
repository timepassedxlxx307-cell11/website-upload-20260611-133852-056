(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobile = document.querySelector('.mobile-nav');

    if (toggle && mobile) {
        toggle.addEventListener('click', function () {
            var open = mobile.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    var hero = document.querySelector('.hero');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-target')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function applyGridFilter(root, options) {
        var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
        var keyword = (options.keyword || '').trim().toLowerCase();
        var category = options.category || '';
        var year = options.year || '';
        var region = options.region || '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = (card.getAttribute('data-search') || '').toLowerCase();
            var match = true;

            if (keyword && haystack.indexOf(keyword) === -1) {
                match = false;
            }

            if (category && card.getAttribute('data-category') !== category) {
                match = false;
            }

            if (year && card.getAttribute('data-year') !== year) {
                match = false;
            }

            if (region && card.getAttribute('data-region') !== region) {
                match = false;
            }

            card.classList.toggle('hidden-card', !match);

            if (match) {
                visible += 1;
            }
        });

        return visible;
    }

    var searchGrid = document.getElementById('searchGrid');

    if (searchGrid) {
        var input = document.getElementById('searchInput');
        var categoryFilter = document.getElementById('categoryFilter');
        var yearFilter = document.getElementById('yearFilter');
        var regionFilter = document.getElementById('regionFilter');
        var status = document.getElementById('searchStatus');

        function refreshSearch() {
            var visible = applyGridFilter(searchGrid, {
                keyword: input ? input.value : '',
                category: categoryFilter ? categoryFilter.value : '',
                year: yearFilter ? yearFilter.value : '',
                region: regionFilter ? regionFilter.value : ''
            });

            if (status) {
                status.textContent = visible > 0 ? '已匹配到相关影视内容' : '没有匹配的内容';
            }
        }

        [input, categoryFilter, yearFilter, regionFilter].forEach(function (element) {
            if (element) {
                element.addEventListener('input', refreshSearch);
                element.addEventListener('change', refreshSearch);
            }
        });
    }

    var localFilter = document.querySelector('.category-local-filter');

    if (localFilter) {
        var pageInput = localFilter.querySelector('.page-filter-input');
        var pageYear = localFilter.querySelector('.page-filter-year');
        var pageGrid = document.querySelector('.searchable-grid');

        function refreshLocal() {
            if (!pageGrid) {
                return;
            }

            applyGridFilter(pageGrid, {
                keyword: pageInput ? pageInput.value : '',
                year: pageYear ? pageYear.value : ''
            });
        }

        [pageInput, pageYear].forEach(function (element) {
            if (element) {
                element.addEventListener('input', refreshLocal);
                element.addEventListener('change', refreshLocal);
            }
        });
    }
}());

function initPlayer(videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hlsInstance = null;
    var ready = false;

    if (!video || !button || !streamUrl) {
        return;
    }

    function attach() {
        if (ready) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function play() {
        attach();
        button.classList.add('is-hidden');
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                button.classList.remove('is-hidden');
            });
        }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener('play', function () {
        button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
            button.classList.remove('is-hidden');
        }
    });
    video.addEventListener('ended', function () {
        button.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
