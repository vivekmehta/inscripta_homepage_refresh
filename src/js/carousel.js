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



// Consulting page "Results that speak for themselves" case studies.
//
// Click-tab pattern with auto-rotate-on-first-view:
//  - When the section enters the viewport, we auto-advance through the cards
//    every 6s so first-time visitors discover that there are 4 case studies.
//  - Hover over the card pauses the rotation (so users can read).
//  - Clicking a nav pill STOPS auto-rotate permanently for the session — the
//    user is now driving.
//  - Mobile uses horizontal swipe; auto-rotate is desktop-only.
//  - prefers-reduced-motion users get no auto-rotate (CSS hides the progress
//    bar and JS skips the timer).
document.addEventListener('DOMContentLoaded', function () {
    var cards        = document.querySelectorAll('.cns-cs-card');
    var navItems    = document.querySelectorAll('.cns-cs-nav-item');
    var right        = document.querySelector('.cns-cs-right');
    var section      = document.querySelector('.cns-cs-scroll-track');

    if (!cards.length) return;

    var ROTATE_MS         = 6000;
    var rotateTimer       = null;
    var fillAnim          = null;  // Web Animations API handle for the active card's line
    var userTookControl   = false; // permanent stop flag
    var sectionInView     = false;
    var hoverPaused       = false;

    function isMobile() { return window.innerWidth <= 991; }

    function prefersReducedMotion() {
        return window.matchMedia
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function canAutoRotate() {
        return !userTookControl && !isMobile() && !prefersReducedMotion();
    }

    function currentIndex() {
        var active = Array.prototype.indexOf.call(
            cards, document.querySelector('.cns-cs-card.active')
        );
        return active >= 0 ? active : 0;
    }

    function resetAllLines() {
        cards.forEach(function (card) {
            var line = card.querySelector('.cns-cs-progress-line');
            if (line) line.style.transform = 'scaleX(0)';
        });
    }

    function scrollToCard(index) {
        if (!right || !cards[index]) return;
        // getBoundingClientRect gives viewport-relative positions, letting us
        // compute the scroll offset relative to the container regardless of
        // which ancestor has position:relative.
        var cardRect  = cards[index].getBoundingClientRect();
        var rightRect = right.getBoundingClientRect();
        right.scrollTo({
            left: right.scrollLeft + (cardRect.left - rightRect.left),
            behavior: 'smooth'
        });
    }

    function setActive(index) {
        index = Math.max(0, Math.min(cards.length - 1, index));
        cards.forEach(function (card, i) {
            card.classList.toggle('active', i === index);
        });
        navItems.forEach(function (item, i) {
            var on = i === index;
            item.classList.toggle('active', on);
            if (on) item.setAttribute('aria-current', 'true');
            else    item.removeAttribute('aria-current');
        });
        // Keep mobile dots in sync
        var dots = document.querySelectorAll('.cns-cs-dot');
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === index);
        });
    }

    function restartProgressBar() {
        // Cancel any in-flight animation
        if (fillAnim) {
            try { fillAnim.cancel(); } catch (e) { /* ignore */ }
            fillAnim = null;
        }
        resetAllLines();
        // Animate the active card's top line
        var activeCard = document.querySelector('.cns-cs-card.active');
        var line = activeCard && activeCard.querySelector('.cns-cs-progress-line');
        if (line && typeof line.animate === 'function') {
            fillAnim = line.animate(
                [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
                { duration: ROTATE_MS, easing: 'linear', fill: 'forwards' }
            );
        }
    }

    function hideProgressBar() {
        if (fillAnim) {
            try { fillAnim.cancel(); } catch (e) { /* ignore */ }
            fillAnim = null;
        }
        resetAllLines();
    }

    function tick() {
        var next = (currentIndex() + 1) % cards.length;
        setActive(next);
        restartProgressBar();
    }

    function startAutoRotate() {
        if (!canAutoRotate() || hoverPaused) return;
        stopAutoRotate(); // clear any existing timer
        restartProgressBar();
        rotateTimer = setInterval(tick, ROTATE_MS);
    }

    function stopAutoRotate() {
        if (rotateTimer) { clearInterval(rotateTimer); rotateTimer = null; }
        hideProgressBar();
    }

    function permanentlyStopAutoRotate() {
        userTookControl = true;
        stopAutoRotate();
    }

    setActive(0);

    // Nav-pill clicks switch cards and stop auto-rotate permanently.
    navItems.forEach(function (item, i) {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            permanentlyStopAutoRotate();
            setActive(i);
            if (isMobile()) scrollToCard(i);
        });
    });

    // Arrow buttons (mobile swipe nav)
    var prevArrow = document.querySelector('.cns-cs-arrow--prev');
    var nextArrow = document.querySelector('.cns-cs-arrow--next');
    if (prevArrow) {
        prevArrow.addEventListener('click', function () {
            var prev = (currentIndex() - 1 + cards.length) % cards.length;
            setActive(prev);
            scrollToCard(prev);
        });
    }
    if (nextArrow) {
        nextArrow.addEventListener('click', function () {
            var next = (currentIndex() + 1) % cards.length;
            setActive(next);
            scrollToCard(next);
        });
    }

    // Hover pauses auto-rotate (so users can read), mouse-leave resumes if the
    // section is still in view and the user hasn't taken control yet.
    if (right) {
        right.addEventListener('mouseenter', function () {
            hoverPaused = true;
            stopAutoRotate();
        });
        right.addEventListener('mouseleave', function () {
            hoverPaused = false;
            if (sectionInView && canAutoRotate()) startAutoRotate();
        });
    }

    // Start/stop rotation based on whether the section is in view.
    // threshold:0 means any pixel of the section being visible triggers
    // intersection — important when the section is taller than the viewport
    // (a higher threshold would never fire in that case).
    if ('IntersectionObserver' in window && section) {
        var sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                sectionInView = entry.isIntersecting;
                if (sectionInView && canAutoRotate() && !hoverPaused) {
                    startAutoRotate();
                } else if (!sectionInView) {
                    stopAutoRotate();
                }
            });
        }, { threshold: 0 });
        sectionObserver.observe(section);
    }

    // Mobile: sync nav pills with the visible card during horizontal swipe.
    if ('IntersectionObserver' in window && right) {
        var cardObserver = new IntersectionObserver(function (entries) {
            if (!isMobile()) return;
            entries.forEach(function (entry) {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    var idx = Array.prototype.indexOf.call(cards, entry.target);
                    if (idx !== -1) setActive(idx);
                }
            });
        }, { root: right, threshold: 0.5 });
        cards.forEach(function (card) { cardObserver.observe(card); });
    }
});
