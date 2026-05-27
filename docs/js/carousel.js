let items = document.querySelectorAll('.carousel .carousel-item')

items.forEach((el) => {
    const minPerSlide = 3
    let next = el.nextElementSibling
    for (var i=1; i<minPerSlide; i++) {
        if (!next) {
            // wrap carousel by using first child
          next = items[0]
        }
        let cloneChild = next.cloneNode(true)
        el.appendChild(cloneChild.children[0])
        next = next.nextElementSibling
    }
})



document.addEventListener('DOMContentLoaded', function () {
    var track    = document.querySelector('.cns-cs-scroll-track');
    var panel    = document.querySelector('.cns-cs-sticky-panel');
    var cards    = document.querySelectorAll('.cns-cs-card');
    var navItems = document.querySelectorAll('.cns-cs-nav-item');

    if (!track || !cards.length) return;

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
    }

    setActive(0);

    window.addEventListener('scroll', function () {
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
            var trackTop  = getOffsetTop(track);
            // Add small offset so the card triggers correctly
            var target    = trackTop + (i * window.innerHeight) + 10;
            window.scrollTo({ top: target, behavior: 'smooth' });
        });
    });
});