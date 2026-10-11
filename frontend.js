document.addEventListener('DOMContentLoaded', () => {
    // Header : effet au défilement
    const header = document.getElementById('header');
    if (header) {
        const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Apparition au défilement
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        revealEls.forEach((el) => observer.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('visible'));
    }

    // Lien de navigation actif selon la section visible
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach((link) => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach((section) => navObserver.observe(section));
    }
});
