// scripts/animations/scroll.js

export function initScrollAnimations(lenis) {
    const isMobile = window.innerWidth < 768;

    // 1. Desvanecer textos del Hero
    gsap.to('.hero-fade-text', {
        opacity: 0,
        pointerEvents: 'none',
        scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: '150px',
            scrub: true
        }
    });

    // 2. Aparecer el Marquee (Sincronizado con el Hero)
    const mobileMarquee = document.getElementById("mobile-marquee");
    if (mobileMarquee && isMobile) {
        gsap.to(mobileMarquee, {
            opacity: 1,
            y: 0,
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: '100px', // CAMBIO: Entra por completo en los primeros 100px de scroll
                scrub: true
            }
        });
    }

    // 3. Aparecer la Quote
    const quoteAnim = document.getElementById("quote-text-anim");
    if (quoteAnim) {
        gsap.set(quoteAnim, { opacity: 0, y: 60 });

        gsap.to(quoteAnim, {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: "power4.out",
            scrollTrigger: {
                trigger: "#quote-marquee-section",
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    }


    window.eyeDockState = window.eyeDockState || { progress: 0 };


    // 1. DISSOLVE EFFECT & PARALLAX
    document.querySelectorAll('[data-speed]').forEach(el => {
        const speed = parseFloat(el.getAttribute('data-speed'));

        if (isMobile) {
            // Keep original upward slide behavior for mobile
            gsap.to(el, {
                y: () => -window.innerHeight * speed * 2,
                ease: "none",
                scrollTrigger: {
                    trigger: "#hero-foreground",
                    start: "top top",
                    end: "20% top",
                    scrub: true,
                    invalidateOnRefresh: true
                }
            });
        } else {
            // Desktop: Phrases dissolve instead of sliding
            gsap.to(el, {
                opacity: 0,
                ease: "none",
                scrollTrigger: {
                    trigger: "#hero-foreground",
                    start: "top top",
                    end: "60% top", // Clears out smoothly before Hero 2 arrives
                    scrub: true,
                }
            });
        }
    });

    // 2. DESKTOP DOCKING & MARQUEE REVEAL
    if (!isMobile) {
        // Trigger the Eye's journey to arrive MUCH earlier
        gsap.to(window.eyeDockState, {
            progress: 1,
            ease: "none", // Linear ease is better for precise docking
            scrollTrigger: {
                trigger: "#hero-foreground",
                start: "top top",
                end: "30% top", // Completes docking almost immediately upon scroll
                scrub: true
            }
        });

        // Reveal the Marquee Basement slightly after the eye docks
        gsap.from("#expertise-desktop-block", {
            y: 60,
            opacity: 0,
            duration: 1.5,
            ease: "power4.out",
            scrollTrigger: {
                trigger: "#biography-section",
                start: "top bottom", // Starts as soon as the bio section enters
                toggleActions: "play none none reverse"
            }
        });
    }

    const processPin = document.querySelector('#process-pin-container');
    const processSlider = document.querySelector('.process-slider');
    const processCards = gsap.utils.toArray('.process-block-card');

    if (processPin && processSlider && processCards.length) {

        gsap.to('.process-header-reveal', {
            y: "0%",
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: { trigger: processPin, start: "top 80%", toggleActions: "play none none reverse" }
        });

        gsap.to("#ascii-wrapper", {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
                trigger: processPin,
                start: "top bottom",
                end: "top top",
                scrub: true
            }
        });

        let mm = gsap.matchMedia();

        mm.add("(min-width: 769px)", () => {
            gsap.to(processSlider, {
                x: () => -(processSlider.scrollWidth - window.innerWidth + 100),
                ease: "none",
                scrollTrigger: {
                    trigger: processPin,
                    start: "top top",
                    end: () => `+=${processSlider.scrollWidth - window.innerWidth}`,
                    pin: true,
                    scrub: true,
                    invalidateOnRefresh: true
                }
            });
        });

        mm.add("(max-width: 768px)", () => {
            const totalScroll = processSlider.scrollWidth - window.innerWidth;
            const numCards = processCards.length;

            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: processPin,
                    start: "center 60%",
                    end: () => `+=${totalScroll * 1.5}`,
                    pin: true,
                    scrub: 0.8,
                    snap: {
                        snapTo: "labels",
                        duration: { min: 0.2, max: 0.4 },
                        delay: 0.05,
                        ease: "power2.inOut"
                    },
                    invalidateOnRefresh: true
                }
            });

            tl.addLabel("card0")
                .to({}, { duration: 0.15 });

            for (let i = 1; i < numCards; i++) {
                tl.to(processSlider, {
                    x: -(totalScroll / (numCards - 1)) * i,
                    ease: "none",
                    duration: 1
                })
                    .addLabel(`card${i}`)
                    .to({}, { duration: 0.15 });
            }

            // --- NUEVO: PARALLAX PARKING DE LA QUOTE (SOLO MOBILE) ---
            const quoteTextContainer = document.getElementById("quote-marquee-text");
            if (quoteTextContainer) {
                // Subimos el z-index por seguridad para que flote sobre las tarjetas si llegan a rozarse
                gsap.set(quoteTextContainer, { zIndex: 50 });

                ScrollTrigger.create({
                    trigger: quoteTextContainer,
                    start: "top 12%", // Se estaciona dejando un respiro debajo del header
                    end: () => tl.scrollTrigger.end, // MAGIA: Toma el tiempo de salida exacto del slider de las tarjetas
                    pin: true,
                    pinSpacing: false // CRÍTICO: Permite que el slider horizontal suba e invada su espacio sin crear márgenes en blanco
                });
            }
        });
    }

    const staticQuoteSection = document.getElementById("static-quote-section");
    if (staticQuoteSection) {
        let mmQuote = gsap.matchMedia();

        mmQuote.add("(max-width: 768px)", () => {
            gsap.set(staticQuoteSection, { zIndex: 40 });

            const qTl = gsap.timeline({
                scrollTrigger: {
                    trigger: staticQuoteSection,
                    start: "top 60%",
                    toggleActions: "play none none reverse"
                }
            });
            qTl.to('.quote-part-1', { y: "0%", duration: 1.2, ease: "expo.out" })
                .to('.quote-part-2', { y: "0%", duration: 1.2, ease: "expo.out" }, "-=1.0");

            ScrollTrigger.create({
                trigger: staticQuoteSection,
                start: "top 25%",
                endTrigger: "#contact",
                end: "top top", // Perfectly synced: Release right when footer hits the top
                pin: true,
                pinSpacing: false
            });
        });

        mmQuote.add("(min-width: 769px)", () => {
            // FIX: Reset the parent wrapper so it stops hiding the children
            gsap.set('.quote-part-1', { y: "0%" });

            // Set the initial states for the spans and the second part
            gsap.set('.quote-part-1 .block', { y: "100%" });
            gsap.set('.quote-part-2', { y: "120%", opacity: 0 });

            const qTl = gsap.timeline({
                scrollTrigger: {
                    trigger: staticQuoteSection,
                    start: "top 90%",
                    end: "center center",
                    scrub: 1.2,
                }
            });

            qTl.to('.quote-part-1 .block', {
                y: "0%",
                ease: "power1.out",
                stagger: 0.1
            })
                .to('.quote-part-2', {
                    y: "0%",
                    opacity: 1,
                    ease: "power1.out"
                }, "-=0.2");
        });
    }
}