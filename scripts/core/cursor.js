// scripts/core/cursor.js

export function initCursor() {
    const isTouchDevice = window.matchMedia("(any-pointer: coarse)").matches;

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
    });

    if (!isTouchDevice) {
        const cursor = document.getElementById("cursor-dot");
        if (!cursor) return; // Safeguard

        let cursorX = mouseX, cursorY = mouseY;

        function lerp(start, end, factor) { return start + (end - start) * factor; }
        
        function updateCursor() {
            cursorX = lerp(cursorX, mouseX, 0.15);
            cursorY = lerp(cursorY, mouseY, 0.15);
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
            requestAnimationFrame(updateCursor);
        }
        updateCursor();

        document.querySelectorAll('.hover-target').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        });

        document.querySelectorAll('.magnetic').forEach(btn => {
            const strength = btn.dataset.strength ? parseFloat(btn.dataset.strength) : 20;
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                gsap.to(btn, { x: (e.clientX - centerX) / rect.width * strength, y: (e.clientY - centerY) / rect.height * strength, duration: 0.6, ease: "power3.out" });
            });
            btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" }));
        });
    }
}