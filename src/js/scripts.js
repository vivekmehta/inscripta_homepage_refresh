//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // ScrollSpy is disabled — Bootstrap 5.0.x crashes on multi-page navs where
    // some links resolve to in-page anchors and others go to other routes/URLs.
    // The nav is primarily multi-page so scroll-based active highlighting added
    // little value and produced a runtime error on every page load.

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                if (!responsiveNavItem.hasAttribute('data-bs-toggle')) {
                    navbarToggler.click();
                }
            }
        });
    });

    // Activate SimpleLightbox plugin for portfolio items
    //new SimpleLightbox({
    //    elements: '#portfolio a.portfolio-box'
    //});

});
