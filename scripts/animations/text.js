// scripts/animations/text.js

export function initHeroGlitch() {
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

export function initMarquees() {
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

        gsap.delayedCall(0.1, () => {
            const distance = inner.scrollWidth / 2;

            if (direction === 1) {
                gsap.fromTo(inner,
                    { x: 0 },
                    { x: -distance, duration: speed, ease: "none", repeat: -1 }
                );
            } else {
                gsap.fromTo(inner,
                    { x: -distance },
                    { x: 0, duration: speed, ease: "none", repeat: -1 }
                );
            }
        });
    }

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

export function initRotatingTitles() {
    const group1 = ["Creative Technologist", "Web Creator", "UX/UI Specialist", "Frontend Coder"];
    const group2 = ["Narrative Architect", "System Thinker", "Product Wizard"];
    const group3 = ["AI Artisan", "Concept Sculptor", "Flow State Skeptic", "Digital Monk"];
    const group4 = ["Void Starer", "Lousy Cook"];

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

export function initRotatingQuotes() {
    const wordsTop = ["Essence", "Product", "Tools", "Workflow"];
    const wordsBottom = ["Visible", "Inevitable", "Human", "Fluid"];

    const topContainer = document.getElementById('quote-top-dynamic');
    const bottomContainer = document.getElementById('quote-bottom-dynamic');
    if (!topContainer || !bottomContainer) return;

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

    gsap.set(topContainer, { width: topElements[0].scrollWidth });
    gsap.set(bottomContainer, { width: bottomElements[0].scrollWidth });

    let currentIndex = 0;
    const CYCLE_TIME = 4000;
    const STAGGER_DELAY = 0.3;

    function updateQuote(container, elements, prevIndex, nextIndex) {
        const elOut = elements[prevIndex];
        const elIn = elements[nextIndex];

        elIn.style.visibility = 'hidden';
        elIn.classList.remove('quote-hidden-bottom', 'quote-hidden-top');
        elIn.classList.add('quote-visible');

        const targetWidth = elIn.offsetWidth;

        gsap.to(container, {
            width: targetWidth,
            duration: 1.2,
            ease: "expo.inOut"
        });

        elIn.style.visibility = 'visible';
        elIn.classList.remove('quote-visible');
        elIn.classList.add('quote-hidden-bottom');

        elements.forEach((el, idx) => {
            if (idx !== nextIndex && idx !== prevIndex) {
                el.style.transition = 'none';
                el.classList.remove('quote-visible', 'quote-hidden-top');
                el.classList.add('quote-hidden-bottom');
            }
        });

        void container.offsetWidth;

        elOut.style.transition = 'all 1200ms cubic-bezier(0.16,1,0.3,1)';
        elOut.classList.add('quote-hidden-top');
        elOut.classList.remove('quote-visible');

        elIn.style.transition = 'all 1200ms cubic-bezier(0.16,1,0.3,1)';
        elIn.classList.remove('quote-hidden-bottom');
        elIn.classList.add('quote-visible');
    }

    setInterval(() => {
        const prevIndex = currentIndex;
        currentIndex = (currentIndex + 1) % wordsTop.length;

        updateQuote(topContainer, topElements, prevIndex, currentIndex);

        gsap.delayedCall(STAGGER_DELAY, () => {
            updateQuote(bottomContainer, bottomElements, prevIndex, currentIndex);
        });

    }, CYCLE_TIME);

    window.addEventListener('resize', () => {
        gsap.set(topContainer, { width: topElements[currentIndex].scrollWidth });
        gsap.set(bottomContainer, { width: bottomElements[currentIndex].scrollWidth });
    });
}