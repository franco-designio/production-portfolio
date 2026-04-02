// scripts/components/ui.js

export function initUI(lenis) {
    // =======================================================
    // PRELOADER & INTRO SEQUENCE TIMELINE
    // =======================================================
    const charsArray = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const row1 = document.getElementById("preload-row-1");
    const row2 = document.getElementById("preload-row-2");
    let intervalCount = 0;

    gsap.set("#main-content", { opacity: 0 });

    const scrambleInterval = setInterval(() => {
        row1.innerText = Array(5).fill(0).map(() => charsArray[Math.floor(Math.random() * charsArray.length)]).join('');
        row2.innerText = Array(5).fill(0).map(() => charsArray[Math.floor(Math.random() * charsArray.length)]).join('');
        intervalCount++;

        if (intervalCount >= 18) {
            clearInterval(scrambleInterval);
            const tl = gsap.timeline({
                onComplete: () => {
                    document.getElementById('preloader').style.display = 'none';
                    document.body.classList.remove("overflow-hidden");
                    ScrollTrigger.refresh();
                    lenis.start();
                }
            });

            gsap.set("#main-content", { opacity: 0 });
            gsap.set("#hero-foreground", { scale: 1.10, transformOrigin: "center center" });

            tl.to([row1, row2], { opacity: 0, duration: 0.2 })
                .to("#main-content", { opacity: 1, duration: 0.1 }, "-=0.1")
                .to("#hero-foreground", { scale: 1, duration: 1.6, ease: "power3.out" })
                .to("#preloader", { opacity: 0, duration: 1.0, ease: "power2.inOut" }, "<");
        }
    }, 35);

    // =======================================================
    // SERVICE CARDS VIDEO HOVER LOGIC & MOBILE DOCKING
    // =======================================================
    const serviceCards = document.querySelectorAll('.process-block-card');

    serviceCards.forEach(card => {
        const video = card.querySelector('video');
        if (!video) return;

        let pauseTimeout;

        card.addEventListener('mouseenter', () => {
            clearTimeout(pauseTimeout);
            video.play().catch(e => console.warn("Video autoplay blocked:", e));
        });

        card.addEventListener('mouseleave', () => {
            pauseTimeout = setTimeout(() => {
                video.pause();
            }, 700);
        });
    });

    if (window.innerWidth <= 768) {
        const observerOptions = {
            rootMargin: '0px',
            threshold: 0.75
        };

        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const vid = entry.target.querySelector('video');
                if (!vid) return;

                if (entry.isIntersecting) {
                    vid.play().catch(e => console.warn("Autoplay blocked:", e));
                    entry.target.classList.add('mobile-active');

                    if (typeof navigator.vibrate === "function") {
                        navigator.vibrate(8);
                    }
                } else {
                    vid.pause();
                    entry.target.classList.remove('mobile-active');
                }
            });
        }, observerOptions);

        serviceCards.forEach(card => videoObserver.observe(card));
    }

    // =======================================================
    // NAVEGACIÓN SUAVE AL INICIO DE SERVICES (LENIS)
    // =======================================================
    const btnServices = document.getElementById('nav-services-link');
    if (btnServices) {
        btnServices.addEventListener('click', (e) => {
            e.preventDefault();

            // Apuntamos al anchor invisible que no está afectado por GSAP
            lenis.scrollTo('#services-anchor', {
                offset: 0,
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        });
    }
}