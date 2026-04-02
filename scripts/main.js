// scripts/main.js

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initSmoothScroll } from './core/lenis.js';
import { initCursor } from './core/cursor.js';
import { initOptimizedAscii } from './canvas/ascii.js';
import { initHeroGlitch, initMarquees, initRotatingTitles, initRotatingQuotes } from './animations/text.js';
import { initScrollAnimations } from './animations/scroll.js';
import { initUI } from './components/ui.js';
import { initPhysicsEngine } from './physics/footer.js'; // <- Importamos Matter.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Core Initializations
    gsap.registerPlugin(ScrollTrigger);
    window.eyeDockState = { progress: 0 };

    const lenis = initSmoothScroll();
    initCursor();
    initUI(lenis);

    // ==========================================
    // INIT ALL EFFECTS WITH REDUCED MOTION SAFEGUARD
    // ==========================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        initOptimizedAscii();
        initScrollAnimations(lenis);
        initHeroGlitch();
        initMarquees();
        initPhysicsEngine(); // <- Inicializamos Matter.js
    } else {
        document.querySelectorAll('.hero-text-pure span').forEach(span => {
            if (span.hasAttribute('data-original')) span.innerText = span.getAttribute('data-original');
        });
        document.getElementById('footer-massive-text').innerText = "LET'S\nCREATE\nSOMETHING";
        gsap.set("#cta-start-project", { opacity: 1, pointerEvents: "auto" });

        const processSlider = document.querySelector('.process-slider');
        if (window.innerWidth > 768) {
            processSlider.style.display = 'flex';
            processSlider.style.overflowX = 'auto';
        }

        gsap.set('.quote-part-1, .quote-part-2', { y: "0%" });
    }

    // Initialize both the titles and the new dynamic quotes
    initRotatingTitles();
    initRotatingQuotes();
});