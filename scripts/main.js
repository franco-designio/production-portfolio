// scripts/main.js

import { initSmoothScroll } from './core/lenis.js';
import { initCursor } from './core/cursor.js';
import { initOptimizedAscii } from './canvas/ascii.js'
import { initHeroGlitch, initMarquees, initRotatingTitles, initRotatingQuotes } from './animations/text.js';

document.addEventListener("DOMContentLoaded", () => {
    // 1. Core Initializations
    gsap.registerPlugin(ScrollTrigger);
    window.eyeDockState = { progress: 0 };

    const lenis = initSmoothScroll();
    initCursor();

    // ==========================================
    // HERO TEXT GLITCH ENGINE (Fading Decode)
    // ==========================================
    function initHeroGlitch() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const phrases = document.querySelectorAll('.hero-text-pure');
        let isHeroVisible = true;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isHeroVisible = entry.isIntersecting;
            });
        }, { threshold: 0 });
        const heroSection = document.getElementById('hero-foreground');
        if (heroSection) {
            observer.observe(heroSection);
        }

        phrases.forEach(phrase => {
            const spans = phrase.querySelectorAll('.glitch-full, .glitch-partial');
            const allCharSpans = [];

            // Wrap each character in a span for individual fading
            spans.forEach(span => {
                const original = span.getAttribute('data-original');
                span.innerHTML = '';

                for (let i = 0; i < original.length; i++) {
                    const charSpan = document.createElement('span');
                    charSpan.style.transition = 'opacity 0.3s ease-in-out';
                    charSpan.style.display = 'inline-block';
                    charSpan.style.willChange = 'opacity';

                    if (original[i] === ' ') {
                        charSpan.innerHTML = '&nbsp;';
                        charSpan.dataset.isSpace = 'true';
                    } else {
                        charSpan.innerText = original[i];
                        charSpan.dataset.orig = original[i];
                        charSpan.dataset.isSpace = 'false';
                        allCharSpans.push(charSpan);
                    }
                    span.appendChild(charSpan);
                }
            });

            let isHovered = false;
            let idleInterval;
            let timeOffset = Math.random() * 100;

            const tick = () => {
                if (isHovered || !isHeroVisible) return;
                timeOffset += 0.2;

                const corruptionWave = (Math.sin(timeOffset) + 1) / 2;
                const targetRandomness = 0.1 + (corruptionWave * 0.7);

                const numToChange = Math.max(1, Math.floor(allCharSpans.length * 0.25));

                for (let i = 0; i < numToChange; i++) {
                    const charSpan = allCharSpans[Math.floor(Math.random() * allCharSpans.length)];
                    charSpan.style.opacity = '0';

                    setTimeout(() => {
                        if (isHovered) return;

                        if (Math.random() < targetRandomness) {
                            charSpan.innerText = chars[Math.floor(Math.random() * chars.length)];
                        } else {
                            charSpan.innerText = charSpan.dataset.orig;
                        }
                        charSpan.style.opacity = '1';
                    }, 300);
                }
            };

            const beginResolve = () => {
                isHovered = true;
                clearInterval(idleInterval);

                let delay = 0;
                allCharSpans.forEach((charSpan) => {
                    if (charSpan.innerText !== charSpan.dataset.orig) {
                        setTimeout(() => {
                            charSpan.style.opacity = '0';
                            setTimeout(() => {
                                charSpan.innerText = charSpan.dataset.orig;
                                charSpan.style.opacity = '1';
                            }, 200);
                        }, delay);
                        delay += 15;
                    } else {
                        charSpan.style.opacity = '1';
                    }
                });
            };

            const resetGlitch = () => {
                isHovered = false;
                clearInterval(idleInterval);
                idleInterval = setInterval(tick, 600);
            };

            phrase.addEventListener('mouseenter', beginResolve);
            phrase.addEventListener('mouseleave', resetGlitch);

            resetGlitch();
        });
    }


    // =======================================================
    // UNIFIED MARQUEES INITIALIZATION
    // =======================================================
    function initMarquees() {
        const T1_WORDS_ARRAY = ['Website Design', 'Brand Narrative', 'Experience Design', 'Creative Direction', 'Visual Identity', 'Art Direction'];
        const T2_WORDS_ARRAY = ['Scroll-Driven Animation', 'Creative Coding', 'Interaction Design', 'Creative Technology', 'Design Systems', 'Prototyping', 'Micro-interactions'];
        const T3_WORDS_ARRAY = ['Emotional Resonance', 'Cinematic UX', 'Attention Design', 'Living Interfaces', 'Designed Curiosity', 'Cognitive Flow', 'Motion Intelligence', 'Perceived Quality'];

        function createMarqueeBand({ selector, words, wordClass, speed, direction = 1 }) {
            const band = document.querySelector(selector);
            if (!band) return;

            let inner = band.querySelector(".marquee-band-inner");
            if (!inner) {
                inner = document.createElement("div");
                inner.className = "marquee-band-inner";
                band.appendChild(inner);
            }
            inner.innerHTML = "";

            // Create TWO sets of the same word sequence for the seamless loop
            for (let r = 0; r < 2; r++) {
                const set = document.createElement("div");
                set.className = "marquee-set";

                words.forEach((text) => {
                    const span = document.createElement("span");
                    span.className = `marquee-word ${wordClass}`;
                    span.textContent = text;
                    set.appendChild(span);

                    const sep = document.createElement("span");
                    sep.className = "marquee-sep";
                    set.appendChild(sep);
                });
                inner.appendChild(set);
            }

            // Wait for layout so scrollWidth is completely accurate
            gsap.delayedCall(0.1, () => {
                const distance = inner.scrollWidth / 2;

                if (direction === 1) {
                    gsap.fromTo(inner,
                        { x: 0 },
                        {
                            x: -distance,
                            duration: speed,
                            ease: "none",
                            repeat: -1
                        }
                    );
                } else {
                    gsap.fromTo(inner,
                        { x: -distance },
                        {
                            x: 0,
                            duration: speed,
                            ease: "none",
                            repeat: -1
                        }
                    );
                }
            });
        }

        // Desktop Marquee
        const deskBandsEl = document.getElementById('desktopMarqueeBands');
        if (deskBandsEl) {
            deskBandsEl.innerHTML = `
                <div class="marquee-band" id="band-d1"></div>
                <div class="marquee-band-divider"></div>
                <div class="marquee-band" id="band-d2"></div>
                <div class="marquee-band-divider"></div>
                <div class="marquee-band" id="band-d3"></div>
            `;
            createMarqueeBand({ selector: "#band-d1", words: T1_WORDS_ARRAY, wordClass: "marquee-word--t1", speed: 30, direction: 1 });
            createMarqueeBand({ selector: "#band-d2", words: T2_WORDS_ARRAY, wordClass: "marquee-word--t2", speed: 35, direction: -1 });
            createMarqueeBand({ selector: "#band-d3", words: T3_WORDS_ARRAY, wordClass: "marquee-word--t3", speed: 40, direction: 1 });
        }

        // Mobile Marquee
        const mobileBandsEl = document.getElementById('mobileMarqueeBands');
        if (mobileBandsEl) {
            mobileBandsEl.innerHTML = `
                <div class="marquee-band" id="band-t1"></div>
                <div class="marquee-band-divider"></div>
                <div class="marquee-band" id="band-t2"></div>
                <div class="marquee-band-divider"></div>
                <div class="marquee-band" id="band-t3"></div>
            `;
            createMarqueeBand({ selector: "#band-t1", words: T1_WORDS_ARRAY, wordClass: "marquee-word--t1", speed: 20, direction: 1 });
            createMarqueeBand({ selector: "#band-t2", words: T2_WORDS_ARRAY, wordClass: "marquee-word--t2", speed: 24, direction: -1 });
            createMarqueeBand({ selector: "#band-t3", words: T3_WORDS_ARRAY, wordClass: "marquee-word--t3", speed: 28, direction: 1 });
        }
    }


    // ==========================================
    // ROTATING JOB TITLES LOGIC (RESTORED/FIXED)
    // ==========================================
    function initRotatingTitles() {
        const group1 = [
            "Creative Technologist",
            "Web Creator",
            "UX/UI Specialist",
            "Frontend Coder",
        ];

        const group2 = [
            "Narrative Architect",
            "System Thinker",
            "Product Wizard",
        ];

        const group3 = [
            "AI Artisan",
            "Concept Sculptor",
            "Flow State Skeptic",
            "Digital Monk",
        ];

        const group4 = [
            "Void Starer",
            "Lousy Cook",
        ];

        const TITLE_DURATION = 3500;

        let isGroup4Active = false;
        let group4Timer = null;

        const allRoles = [...group1, ...group2, ...group3, ...group4].map((title, index) => {
            const words = title.split(' ');
            const highlight = words.length > 1 ? words.pop() + '.' : words[0] + '.';
            const text = words.length > 0 ? words.join(' ') + ' ' : '';
            return { id: `role-${index}`, full: title, text, highlight };
        });

        const container = document.getElementById('role-container');
        if (!container) return;

        const sectionToObserve = container.closest('section') || container.parentElement;

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!isGroup4Active && !group4Timer) {
                        group4Timer = setTimeout(() => {
                            isGroup4Active = true;
                        }, 30000);
                    }
                } else {
                    if (group4Timer) {
                        clearTimeout(group4Timer);
                        group4Timer = null;
                    }
                    isGroup4Active = false;
                }
            });
        }, { threshold: 0.2 });

        if (sectionToObserve) {
            sectionObserver.observe(sectionToObserve);
        }

        container.innerHTML = '';
        const roleElements = {};

        allRoles.forEach(role => {
            const span = document.createElement('span');
            const initialClass = role.full === group1[0] ? 'role-visible' : 'role-hidden-bottom';

            const innerHTMLStr = `
                <span class="font-sans font-semibold inline">${role.text}</span>
                <span class="italic font-normal text-[var(--fg)]/80 pr-2 inline" style="font-family: 'Instrument Serif', serif;">${role.highlight}</span>
            `;

            span.className = `role-wrapper ${initialClass}`;
            span.innerHTML = innerHTMLStr;
            container.appendChild(span);
            roleElements[role.full] = span;
        });

        // The invisible spacer ensures the grid doesn't collapse during transitions
        const spacerElement = document.createElement('span');
        spacerElement.className = "role-wrapper opacity-0 pointer-events-none invisible relative";
        spacerElement.innerHTML = `<span class="font-sans font-semibold inline">Professional Procrastinator</span><span class="italic font-normal text-[var(--fg)]/80 pr-2 inline" style="font-family: 'Instrument Serif', serif;">Technologist.</span>`;
        container.appendChild(spacerElement);

        let currentTitle = group1[0];
        let prevTitle = null;
        let group1Index = 0;

        setInterval(() => {
            prevTitle = currentTitle;

            const r = Math.random();
            if (isGroup4Active && r > 0.90) {
                const randomIndex = Math.floor(Math.random() * group4.length);
                currentTitle = group4[randomIndex];
            } else if (r < 0.75) {
                group1Index = (group1Index + 1) % group1.length;
                currentTitle = group1[group1Index];
            } else if (r < 0.85) {
                const randomIndex = Math.floor(Math.random() * group2.length);
                currentTitle = group2[randomIndex];
            } else {
                const randomIndex = Math.floor(Math.random() * group3.length);
                currentTitle = group3[randomIndex];
            }

            allRoles.forEach(role => {
                const el = roleElements[role.full];
                if (role.full !== currentTitle && role.full !== prevTitle) {
                    el.style.transition = 'none';
                    el.classList.remove('role-visible', 'role-hidden-top');
                    el.classList.add('role-hidden-bottom');
                }
            });

            void container.offsetWidth;

            allRoles.forEach(role => {
                const el = roleElements[role.full];

                if (role.full === currentTitle) {
                    el.style.transition = 'all 800ms cubic-bezier(0.16,1,0.3,1)';
                    el.classList.remove('role-hidden-bottom', 'role-hidden-top');
                    el.classList.add('role-visible');
                } else if (role.full === prevTitle) {
                    el.style.transition = 'all 800ms cubic-bezier(0.16,1,0.3,1)';
                    el.classList.remove('role-visible', 'role-hidden-bottom');
                    el.classList.add('role-hidden-top');
                }
            });

        }, TITLE_DURATION);
    }

    // ==========================================
    // INIT ALL EFFECTS WITH REDUCED MOTION SAFEGUARD
    // ==========================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        initOptimizedAscii();
        initScrollAnimations();
        initHeroGlitch();
        initMarquees();
    } else {
        document.querySelectorAll('.hero-text-pure span').forEach(span => {
            if (span.hasAttribute('data-original')) span.innerText = span.getAttribute('data-original');
        });
        document.getElementById('footer-massive-text').innerText = "LET'S\nCREATE\nSOMETHING";
        // document.getElementById('measurement-container').style.opacity = '1';
        gsap.set("#cta-start-project", { opacity: 1, pointerEvents: "auto" });

        const processSlider = document.querySelector('.process-slider');
        if (window.innerWidth > 768) {
            processSlider.style.display = 'flex';
            processSlider.style.overflowX = 'auto';
        }

        // This ensures the new quote is visible even if animations are disabled
        gsap.set('.quote-part-1, .quote-part-2', { y: "0%" });
    }

    // ==========================================
    // ROTATING DYNAMIC QUOTES LOGIC (REFINED STAGGER & LAYOUT SHIFT)
    // ==========================================
    function initRotatingQuotes() {
        const wordsTop = ["Essence", "Product", "Tools", "Workflow"];
        const wordsBottom = ["Visible", "Inevitable", "Human", "Fluid"];

        const topContainer = document.getElementById('quote-top-dynamic');
        const bottomContainer = document.getElementById('quote-bottom-dynamic');
        if (!topContainer || !bottomContainer) return;

        // 1. Adiós a los Spacers: Limpiamos el HTML interno
        topContainer.innerHTML = '';
        bottomContainer.innerHTML = '';

        const topElements = [];
        const bottomElements = [];

        function createElements(words, container, elementsArr) {
            words.forEach((word, index) => {
                const span = document.createElement('span');
                const initialClass = index === 0 ? 'quote-visible' : 'quote-hidden-bottom';
                span.className = `quote-wrapper ${initialClass}`;
                span.innerText = word;
                container.appendChild(span);
                elementsArr.push(span);
            });
        }

        createElements(wordsTop, topContainer, topElements);
        createElements(wordsBottom, bottomContainer, bottomElements);

        // Ajustamos el ancho inicial basado en la primera palabra (soporta fuentes fluidas)
        gsap.set(topContainer, { width: topElements[0].scrollWidth });
        gsap.set(bottomContainer, { width: bottomElements[0].scrollWidth });

        let currentIndex = 0;
        const CYCLE_TIME = 4000;
        const STAGGER_DELAY = 0.3; // El "sweet spot" de 300ms

        function updateQuote(container, elements, prevIndex, nextIndex) {
            const elOut = elements[prevIndex];
            const elIn = elements[nextIndex];

            // 1. Forzamos visibilidad momentánea para medir el ancho real
            elIn.style.visibility = 'hidden';
            elIn.classList.remove('quote-hidden-bottom', 'quote-hidden-top');
            elIn.classList.add('quote-visible');

            const targetWidth = elIn.offsetWidth;

            // 2. Aplicamos el ancho al contenedor para que el centrado sea suave
            gsap.to(container, {
                width: targetWidth,
                duration: 1.2,
                ease: "expo.inOut"
            });

            // 3. Restauramos para la animación
            elIn.style.visibility = 'visible';
            elIn.classList.remove('quote-visible');
            elIn.classList.add('quote-hidden-bottom');

            // Limpieza de otros elementos
            elements.forEach((el, idx) => {
                if (idx !== nextIndex && idx !== prevIndex) {
                    el.style.transition = 'none';
                    el.classList.remove('quote-visible', 'quote-hidden-top');
                    el.classList.add('quote-hidden-bottom');
                }
            });

            void container.offsetWidth; // Reflow

            // Animación de salida (Arriba)
            elOut.style.transition = 'all 1200ms cubic-bezier(0.16,1,0.3,1)';
            elOut.classList.add('quote-hidden-top');
            elOut.classList.remove('quote-visible');

            // Animación de entrada (Desde abajo)
            elIn.style.transition = 'all 1200ms cubic-bezier(0.16,1,0.3,1)';
            elIn.classList.remove('quote-hidden-bottom');
            elIn.classList.add('quote-visible');
        }

        // 2. Modificamos el loop para separar los tiempos (Stagger)
        setInterval(() => {
            const prevIndex = currentIndex;
            currentIndex = (currentIndex + 1) % wordsTop.length;

            // Línea 1: Se ejecuta de inmediato
            updateQuote(topContainer, topElements, prevIndex, currentIndex);

            // Línea 2: Se ejecuta con el desfase de 300ms
            gsap.delayedCall(STAGGER_DELAY, () => {
                updateQuote(bottomContainer, bottomElements, prevIndex, currentIndex);
            });

        }, CYCLE_TIME);

        // Seguro para mantener la fluidez si el usuario redimensiona la ventana
        window.addEventListener('resize', () => {
            gsap.set(topContainer, { width: topElements[currentIndex].scrollWidth });
            gsap.set(bottomContainer, { width: bottomElements[currentIndex].scrollWidth });
        });
    }

    // Initialize both the titles and the new dynamic quotes
    initRotatingTitles();
    initRotatingQuotes();


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
    // SCROLL ANIMATIONS & FOOTER PHYSICS LOGIC
    // =======================================================

    let engine = Matter.Engine.create();
    let world = engine.world;
    let runner = null;
    let physicsInitialized = false;
    let letters = [];
    let currentState = 1; // 1: Initial Fall, 2: Locked (Assembly), 3: Play & Post-Close
    let ground, rightWall, leftWall;
    let mouseConstraint = null;
    let physicsResizeHandler = null;

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            if (runner) Matter.Runner.stop(runner);
        } else {
            if (runner && physicsInitialized && (currentState === 1 || currentState === 3)) {
                Matter.Runner.start(runner, engine);
            }
        }
    });

    function initScrollAnimations() {
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

        const container = document.getElementById('physics-container');
        const metaBar = document.getElementById('footer-meta-bar');

        function resetPhysics() {
            if (runner) Matter.Runner.stop(runner);

            Matter.Events.off(engine);
            if (mouseConstraint) {
                Matter.Events.off(mouseConstraint);
                mouseConstraint = null;
            }

            if (physicsResizeHandler) {
                window.removeEventListener('resize', physicsResizeHandler);
                physicsResizeHandler = null;
            }

            Matter.World.clear(world);
            Matter.Engine.clear(engine);
            container.innerHTML = '';
            document.getElementById('measurement-container').style.opacity = '1';
            physicsInitialized = false;
            letters = [];
            currentState = 1;

            gsap.set("#stay-and-play-msg", { opacity: 0 });
            const ctaBtn = document.getElementById('cta-start-project');
            if (ctaBtn) {
                ctaBtn.innerHTML = 'Tell Me About Your Vision';
                gsap.set(ctaBtn, { opacity: 0, pointerEvents: "none" });
            }
        }

        function initPhysics() {
            if (physicsInitialized) return;
            physicsInitialized = true;

            const width = container.clientWidth;
            const height = container.clientHeight;

            const isMobile = window.innerWidth < 768;
            const blockAdjust = isMobile ? { x: 0, y: 120 } : { x: 0, y: 24 }; //Position Adjustment Falling letters block - isMobile ? { Ajustes Mobile } : { Ajustes Desktop };

            const containerRect = container.getBoundingClientRect();
            const metaRect = metaBar.getBoundingClientRect();

            const thickness = 100;
            const groundY = metaRect.top - containerRect.top - 10;

            ground = Matter.Bodies.rectangle(width / 2, groundY + thickness / 2, width * 2, thickness, { isStatic: true });
            leftWall = Matter.Bodies.rectangle(-thickness / 2, height / 2, thickness, height * 3, { isStatic: true });
            rightWall = Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 3, { isStatic: true });
            Matter.World.add(world, [ground, leftWall, rightWall]);

            const h2 = document.getElementById('footer-massive-text');
            h2.innerHTML = '';

            const words = ["LET'S", "CREATE", "SOMETHING"];
            const measuredSpans = [];

            words.forEach((word, wIdx) => {
                word.split('').forEach((char) => {
                    const span = document.createElement('span');
                    span.style.display = 'inline-block';
                    span.innerText = char;
                    h2.appendChild(span);
                    measuredSpans.push({ char, span });
                });
                if (wIdx < words.length - 1) {
                    h2.appendChild(document.createElement('br'));
                }
            });

            measuredSpans.forEach((item) => {
                const rect = item.span.getBoundingClientRect();

                const x = rect.left - containerRect.left + rect.width / 2 + blockAdjust.x;
                const y = rect.top - containerRect.top + rect.height / 2 + blockAdjust.y;

                const clone = document.createElement('div');
                clone.className = "absolute text-[clamp(8vw,11vw,12rem)] leading-[0.85] font-serif tracking-[0.05em] text-center select-none text-[var(--fg)] pointer-events-none";
                clone.innerText = item.char;
                clone.setAttribute('aria-hidden', 'true');

                clone.style.left = `${x}px`;
                clone.style.top = `${y}px`;
                clone.style.transform = `translate(-50%, -50%)`;
                container.appendChild(clone);

                const bodyWidth = rect.width * 0.65;
                const bodyHeight = rect.height * 0.75;

                const body = Matter.Bodies.rectangle(x, y, bodyWidth, bodyHeight, {
                    restitution: 0.3,
                    friction: 0.8,
                    density: 0.05,
                    isStatic: true
                });

                // Falling Letters Block Position Adjustment (Handled by block Adjust above)
                letters.push({
                    element: clone,
                    body: body,
                    originX: x,
                    originY: y
                });
                Matter.World.add(world, body);
            });

            document.getElementById('measurement-container').style.opacity = '0';

            // Attach the trigger to the window so ScrollTrigger can call it
            window.triggerFooterFall = () => {
                if (currentState === 1 && physicsInitialized) {

                    // 1. Drop the letters
                    letters.forEach(item => {
                        Matter.Body.setStatic(item.body, false);
                        Matter.Body.setVelocity(item.body, {
                            x: (Math.random() - 0.5) * 4,
                            y: (Math.random() - 0.5) * 4
                        });
                        Matter.Body.setAngularVelocity(item.body, (Math.random() - 0.5) * 0.15);
                    });

                    // 2. Fade in CTA Button right after letters start falling
                    setTimeout(() => {
                        const btn = document.getElementById('cta-start-project');
                        if (btn) {
                            gsap.to(btn, {
                                opacity: 1,
                                duration: 0.8,
                                onComplete: () => btn.style.pointerEvents = "auto"
                            });
                        }
                    }, 400); // 400ms delay gives the letters time to separate visually
                }
            };

            const mouse = Matter.Mouse.create(container);
            mouseConstraint = Matter.MouseConstraint.create(engine, {
                mouse: mouse,
                constraint: {
                    stiffness: 0.2,
                    render: { visible: false }
                }
            });
            Matter.World.add(world, mouseConstraint);

            const cursorDot = document.getElementById('cursor-dot');
            Matter.Events.on(mouseConstraint, 'mousedown', function () {
                if (mouseConstraint.body && cursorDot) cursorDot.classList.add('hovered');
            });
            Matter.Events.on(mouseConstraint, 'mouseup', function () {
                if (cursorDot) cursorDot.classList.remove('hovered');
            });

            Matter.Events.on(engine, 'afterUpdate', function () {
                letters.forEach((item) => {
                    item.element.style.left = `${item.body.position.x}px`;
                    item.element.style.top = `${item.body.position.y}px`;
                    item.element.style.transform = `translate(-50%, -50%) rotate(${item.body.angle}rad)`;
                });
            });

            const ctaBtn = document.getElementById('cta-start-project');
            if (ctaBtn) {
                const newCtaBtn = ctaBtn.cloneNode(true);
                ctaBtn.parentNode.replaceChild(newCtaBtn, ctaBtn);

                newCtaBtn.addEventListener('click', () => {
                    if (currentState !== 1 && currentState !== 3) return;
                    currentState = 2;

                    newCtaBtn.style.pointerEvents = 'none';
                    newCtaBtn.innerHTML = 'ASSEMBLING...';
                    gsap.to("#stay-and-play-msg", { opacity: 0, duration: 0.3 });

                    const reassemblePromise = new Promise((resolve) => {
                        let completed = 0;
                        letters.forEach((item, index) => {
                            Matter.Body.setStatic(item.body, true);

                            const posProxy = { x: item.body.position.x, y: item.body.position.y };
                            gsap.to(posProxy, {
                                x: item.originX,
                                y: item.originY,
                                duration: 1.5,
                                ease: "expo.inOut",
                                delay: index * 0.03,
                                onUpdate: function () {
                                    Matter.Body.setPosition(item.body, { x: posProxy.x, y: posProxy.y });
                                }
                            });

                            const angleProxy = { angle: item.body.angle };
                            gsap.to(angleProxy, {
                                angle: 0,
                                duration: 1.5,
                                ease: "expo.inOut",
                                delay: index * 0.03,
                                onUpdate: function () {
                                    Matter.Body.setAngle(item.body, angleProxy.angle);
                                },
                                onComplete: () => {
                                    completed++;
                                    if (completed === letters.length) {
                                        resolve();
                                    }
                                }
                            });
                        });
                    });

                    reassemblePromise.then(() => {
                        // window.open("https://francodesignio.notion.site/99f7ea323bbe82d1991081a507e15493?pvs=105", "_blank", "noopener,noreferrer");

                        gsap.to(newCtaBtn, { opacity: 0, duration: 0.5 });

                        setTimeout(() => {
                            gsap.to("#stay-and-play-msg", { opacity: 1, duration: 0.5 });
                            currentState = 3;

                            letters.forEach(item => {
                                Matter.Body.setStatic(item.body, false);
                                Matter.Body.setVelocity(item.body, {
                                    x: (Math.random() - 0.5) * 4,
                                    y: (Math.random() - 0.5) * 4
                                });
                                Matter.Body.setAngularVelocity(item.body, (Math.random() - 0.5) * 0.15);
                            });

                            setTimeout(() => {
                                newCtaBtn.innerHTML = 'Tell Me About Your Vision';
                                gsap.to(newCtaBtn, { opacity: 1, duration: 0.5, onComplete: () => newCtaBtn.style.pointerEvents = "auto" });
                            }, 1000);

                        }, 600);
                    });
                });
            }

            runner = Matter.Runner.create();
            Matter.Runner.run(runner, engine);

            physicsResizeHandler = () => {
                if (!physicsInitialized || !container || !metaBar) return;
                const newWidth = container.clientWidth;
                const newHeight = container.clientHeight;
                const cRect = container.getBoundingClientRect();
                const mRect = metaBar.getBoundingClientRect();
                const newGroundY = mRect.top - cRect.top - 10;

                Matter.Body.setPosition(ground, { x: newWidth / 2, y: newGroundY + thickness / 2 });
                Matter.Body.setPosition(rightWall, { x: newWidth + thickness / 2, y: newHeight / 2 });
                Matter.Body.setPosition(leftWall, { x: -thickness / 2, y: newHeight / 2 });
            };
            window.addEventListener('resize', physicsResizeHandler);
        }

        // Setup Physics when footer comes into view
        ScrollTrigger.create({
            trigger: "#contact",
            start: "top 80%",
            onEnter: () => {
                resetPhysics();
                initPhysics();
            },
            onLeaveBack: () => {
                resetPhysics();
            }
        });

        let bottomTriggered = false;
        ScrollTrigger.create({
            trigger: "#contact",
            start: "top 5%", // Reliable start point: fires exactly as the 100vh footer covers the screen
            onEnter: () => {
                if (!bottomTriggered) {
                    bottomTriggered = true;
                    // Wait exactly 1 second, then trigger the fall and button fade
                    setTimeout(() => {
                        if (window.triggerFooterFall) window.triggerFooterFall();
                    }, 1000);
                }
            },
            onLeaveBack: () => {
                bottomTriggered = false; // Resets if they scroll back up
            }
        });
    }

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

});
