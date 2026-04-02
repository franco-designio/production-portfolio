// scripts/physics/footer.js

export function initPhysicsEngine() {
    let engine = Matter.Engine.create();
    let world = engine.world;
    let runner = null;
    let physicsInitialized = false;
    let letters = [];
    let currentState = 1; // 1: Initial Fall, 2: Locked (Assembly), 3: Play & Post-Close
    let ground, rightWall, leftWall;
    let mouseConstraint = null;
    let physicsResizeHandler = null;

    const container = document.getElementById('physics-container');
    const metaBar = document.getElementById('footer-meta-bar');

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            if (runner) Matter.Runner.stop(runner);
        } else {
            if (runner && physicsInitialized && (currentState === 1 || currentState === 3)) {
                Matter.Runner.start(runner, engine);
            }
        }
    });

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
        if (container) container.innerHTML = '';
        const mContainer = document.getElementById('measurement-container');
        if (mContainer) mContainer.style.opacity = '1';
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
        if (physicsInitialized || !container || !metaBar) return;
        physicsInitialized = true;

        const width = container.clientWidth;
        const height = container.clientHeight;
        const isMobile = window.innerWidth < 768;
        const blockAdjust = isMobile ? { x: 0, y: 120 } : { x: 0, y: 24 };

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

            letters.push({ element: clone, body: body, originX: x, originY: y });
            Matter.World.add(world, body);
        });

        document.getElementById('measurement-container').style.opacity = '0';

        window.triggerFooterFall = () => {
            if (currentState === 1 && physicsInitialized) {
                letters.forEach(item => {
                    Matter.Body.setStatic(item.body, false);
                    Matter.Body.setVelocity(item.body, {
                        x: (Math.random() - 0.5) * 4,
                        y: (Math.random() - 0.5) * 4
                    });
                    Matter.Body.setAngularVelocity(item.body, (Math.random() - 0.5) * 0.15);
                });
                setTimeout(() => {
                    const btn = document.getElementById('cta-start-project');
                    if (btn) {
                        gsap.to(btn, { opacity: 1, duration: 0.8, onComplete: () => btn.style.pointerEvents = "auto" });
                    }
                }, 400);
            }
        };

        const mouse = Matter.Mouse.create(container);
        mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
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
                            x: item.originX, y: item.originY, duration: 1.5, ease: "expo.inOut", delay: index * 0.03,
                            onUpdate: function () { Matter.Body.setPosition(item.body, { x: posProxy.x, y: posProxy.y }); }
                        });
                        const angleProxy = { angle: item.body.angle };
                        gsap.to(angleProxy, {
                            angle: 0, duration: 1.5, ease: "expo.inOut", delay: index * 0.03,
                            onUpdate: function () { Matter.Body.setAngle(item.body, angleProxy.angle); },
                            onComplete: () => {
                                completed++;
                                if (completed === letters.length) resolve();
                            }
                        });
                    });
                });

                reassemblePromise.then(() => {
                    gsap.to(newCtaBtn, { opacity: 0, duration: 0.5 });
                    setTimeout(() => {
                        gsap.to("#stay-and-play-msg", { opacity: 1, duration: 0.5 });
                        currentState = 3;
                        letters.forEach(item => {
                            Matter.Body.setStatic(item.body, false);
                            Matter.Body.setVelocity(item.body, { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 });
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

    ScrollTrigger.create({
        trigger: "#contact",
        start: "top 80%",
        onEnter: () => { resetPhysics(); initPhysics(); },
        onLeaveBack: () => { resetPhysics(); }
    });

    let bottomTriggered = false;
    ScrollTrigger.create({
        trigger: "#contact",
        start: "top 5%",
        onEnter: () => {
            if (!bottomTriggered) {
                bottomTriggered = true;
                setTimeout(() => {
                    if (window.triggerFooterFall) window.triggerFooterFall();
                }, 1000);
            }
        },
        onLeaveBack: () => { bottomTriggered = false; }
    });
}