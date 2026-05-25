let items = document.querySelectorAll('.carousel .carousel-item')

items.forEach((el) => {
    const minPerSlide = 3
    let next = el.nextElementSibling
    for (var i=1; i<minPerSlide; i++) {
        if (!next) {
            next = items[0]
        }
        let cloneChild = next.cloneNode(true)
        el.appendChild(cloneChild.children[0])
        next = next.nextElementSibling
    }
})



document.addEventListener('DOMContentLoaded', function () {
    var track    = document.querySelector('.cns-cs-scroll-track');
    var cards    = document.querySelectorAll('.cns-cs-card');
    var navItems = document.querySelectorAll('.cns-cs-nav-item');
    var right    = document.querySelector('.cns-cs-right');
    var dots     = document.querySelectorAll('.cns-cs-dot');
    var btnPrev  = document.getElementById('cns-arrow-prev');
    var btnNext  = document.getElementById('cns-arrow-next');

    if (!track || !cards.length) return;

    function isMobile() { return window.innerWidth <= 991; }

    function getOffsetTop(el) {
        var top = 0;
        while (el) { top += el.offsetTop; el = el.offsetParent; }
        return top;
    }

    function setActive(index) {
        index = Math.max(0, Math.min(cards.length - 1, index));
        cards.forEach(function (card, i) {
            card.classList.toggle('active', i === index);
        });
        navItems.forEach(function (item, i) {
            item.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === index);
        });
        if (btnPrev) btnPrev.disabled = index === 0;
        if (btnNext) btnNext.disabled = index === cards.length - 1;
    }

    setActive(0);

    window.addEventListener('scroll', function () {
        if (isMobile()) return;
        var trackTop  = getOffsetTop(track);
        var scrolled  = window.pageYOffset - trackTop;
        if (scrolled < 0) { setActive(0); return; }
        var total     = track.offsetHeight - window.innerHeight;
        if (scrolled >= total) { setActive(cards.length - 1); return; }
        setActive(Math.floor(scrolled / window.innerHeight));
    }, { passive: true });

    navItems.forEach(function (item, i) {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            if (isMobile()) {
                if (right && cards[i]) {
                    right.scrollTo({ left: cards[i].offsetLeft, behavior: 'smooth' });
                }
                return;
            }
            var trackTop = getOffsetTop(track);
            window.scrollTo({ top: trackTop + (i * window.innerHeight) + 10, behavior: 'smooth' });
        });
    });

    function scrollToCard(index) {
        if (right && cards[index]) {
            right.scrollTo({ left: cards[index].offsetLeft, behavior: 'smooth' });
        }
    }

    function currentIndex() {
        var active = Array.prototype.indexOf.call(cards, document.querySelector('.cns-cs-card.active'));
        return active >= 0 ? active : 0;
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', function () {
            scrollToCard(Math.max(0, currentIndex() - 1));
        });
    }
    if (btnNext) {
        btnNext.addEventListener('click', function () {
            scrollToCard(Math.min(cards.length - 1, currentIndex() + 1));
        });
    }

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            if (!isMobile()) return;
            entries.forEach(function (entry) {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    var idx = Array.prototype.indexOf.call(cards, entry.target);
                    if (idx !== -1) setActive(idx);
                }
            });
        }, { root: right, threshold: 0.5 });
        cards.forEach(function (card) { observer.observe(card); });
    }
});
