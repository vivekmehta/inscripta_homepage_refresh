            (function () {
                var cards = document.querySelectorAll('.cns-cs-card');
                var navItems = document.querySelectorAll('.cns-cs-nav-item');
                if (!cards.length || !navItems.length) return;

                var observer = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            var num = entry.target.id.split('-')[1];
                            navItems.forEach(function (item) {
                                item.classList.toggle('active', item.dataset.cs === num);
                            });
                        }
                    });
                }, { root: null, rootMargin: '-25% 0px -55% 0px', threshold: 0 });

                cards.forEach(function (c) { observer.observe(c); });

                navItems.forEach(function (item) {
                    item.addEventListener('click', function (e) {
                        e.preventDefault();
                        var target = document.querySelector(item.getAttribute('href'));
                        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                });
            })();