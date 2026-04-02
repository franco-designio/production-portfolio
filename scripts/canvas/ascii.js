// scripts/canvas/ascii.js
import * as THREE from 'three';

export function initOptimizedAscii() {
    const canvas = document.getElementById('ascii-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false });

    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;

    let charWidth = 6;
    let charHeight = 10;

    let columns = Math.ceil(width / charWidth);
    let rows = Math.ceil(height / charHeight);

    let pixelBuffer = new Uint8Array(columns * rows * 4);
    let hashGrid, colX, rowY;
    let noise1_sin_x, noise1_cos_x, noise2_sin_y, noise2_cos_y;
    let noise3_sin_xy, noise3_cos_xy, noise4_sin_xy, noise4_cos_xy;

    const bucketCounts = new Int32Array(56);
    let bucketX = [];
    let bucketY = [];
    let bucketChars = [];

    const mouse = { x: width / 2, y: height / 2, tx: width / 2, ty: height / 2 };
    let currentShape = 'eye';

    let scrollY = window.scrollY;

    let lastTouchTime = 0;
    let isInteracting = false;
    const IDLE_RETURN_TIME = 3000;
    let focalX = width / 2;
    let focalY = height / 2;

    const HOVER_CHARS = " ...---_::;;++==**???xyzabc123456789N$#";
    const SHAPE_CHARS = " .-=*&%#@M";
    const HOVER_CHARS_LEN = 38;
    const SHAPE_CHARS_LEN = 9;
    const hexToRgba = (hex, a) => {
        const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    };

    const rootStyles = getComputedStyle(document.documentElement);
    const EYE_COLOR = rootStyles.getPropertyValue('--shape-eye').trim() || "#ffffff";
    const TORUS_COLOR = rootStyles.getPropertyValue('--shape-torus').trim() || "#00ff00";
    const PAWN_COLOR = rootStyles.getPropertyValue('--shape-pawn').trim() || "#ffd500";
    const LOGO_COLOR = rootStyles.getPropertyValue('--shape-logo').trim() || "#e4e4e4";

    const ALPHA_STYLES = Array.from({ length: 11 }, (_, i) => `rgba(180, 190, 200, ${i / 10})`);
    const EYE_STYLES = Array.from({ length: 11 }, (_, i) => hexToRgba(EYE_COLOR, i / 10));
    const TORUS_STYLES = Array.from({ length: 11 }, (_, i) => hexToRgba(TORUS_COLOR, i / 10));
    const PAWN_STYLES = Array.from({ length: 11 }, (_, i) => hexToRgba(PAWN_COLOR, i / 10));
    const LOGO_STYLES = Array.from({ length: 11 }, (_, i) => hexToRgba(LOGO_COLOR, i / 10));

    const BAYER = new Float32Array([0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => v / 16.0 - 0.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, alpha: true });
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 8, 10);
    scene.add(mainLight);
    const rimLight = new THREE.PointLight(0xaaaaaa, 1.0, 50);
    rimLight.position.set(-8, -8, -5);
    scene.add(rimLight);

    const eyeGroup = new THREE.Group();
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(2.5, 32, 32), new THREE.MeshLambertMaterial({ color: 0xff0000 }));
    const iris = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 16), new THREE.MeshLambertMaterial({ color: 0x550000 }));
    iris.position.z = 2.25; iris.scale.z = 0.2;
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 16), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    pupil.position.z = 2.45; pupil.scale.z = 0.1;
    eyeGroup.add(sclera, iris, pupil);
    scene.add(eyeGroup);

    const torusGroup = new THREE.Group();
    const torus = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.7, 16, 64), new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.2, metalness: 0.8 }));
    torusGroup.add(torus); torusGroup.scale.set(0, 0, 0); scene.add(torusGroup);

    const pawnGroup = new THREE.Group();
    const pawnMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff, roughness: 0.4 });
    const pawnBase = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.4, 32), pawnMaterial); pawnBase.position.y = -1.8;
    const pawnBody = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 1.8, 32), pawnMaterial); pawnBody.position.y = -0.7;
    const pawnCollar = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.15, 16, 32), pawnMaterial); pawnCollar.position.y = 0.3; pawnCollar.rotation.x = Math.PI / 2;
    const pawnHead = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32), pawnMaterial); pawnHead.position.y = 1;
    pawnGroup.add(pawnBase, pawnBody, pawnCollar, pawnHead); pawnGroup.scale.set(0, 0, 0); scene.add(pawnGroup);

    const logoGroup = new THREE.Group();
    const logoMaterial = new THREE.MeshStandardMaterial({ color: 0xff00ff, roughness: 0.1, metalness: 0.5 });
    const logoInner = new THREE.Group(); logoInner.scale.set(0.85, 0.85, 0.85);
    const extrudeSettings = { depth: 0.12, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 2 };

    const slashShape = new THREE.Shape(); slashShape.moveTo(0, 0); slashShape.lineTo(0.66, 0); slashShape.lineTo(2.96, 5.0); slashShape.lineTo(2.3, 5.0); slashShape.lineTo(0, 0);
    const slashGeo = new THREE.ExtrudeGeometry(slashShape, extrudeSettings); const slash = new THREE.Mesh(slashGeo, logoMaterial); slash.position.set(-3.4, -2.5, -0.06);

    const phiRingShape = new THREE.Shape(); phiRingShape.absellipse(0, 0, 1.4, 1.6, 0, Math.PI * 2, false, 0);
    const phiHole = new THREE.Path(); phiHole.absellipse(0, 0, 0.96, 1.36, 0, Math.PI * 2, true, 0); phiRingShape.holes.push(phiHole);
    const phiRingGeo = new THREE.ExtrudeGeometry(phiRingShape, extrudeSettings); const phiRing = new THREE.Mesh(phiRingGeo, logoMaterial); phiRing.position.set(0.1, 0, -0.06);

    const pillarShape = new THREE.Shape(); pillarShape.moveTo(-1.05, -2.32); pillarShape.lineTo(1.05, -2.32); pillarShape.lineTo(1.05, -2.1); pillarShape.lineTo(0.22, -2.1); pillarShape.lineTo(0.22, 2.1); pillarShape.lineTo(1.05, 2.1); pillarShape.lineTo(1.05, 2.32); pillarShape.lineTo(-1.05, 2.32); pillarShape.lineTo(-1.05, 2.1); pillarShape.lineTo(-0.22, 2.1); pillarShape.lineTo(-0.22, -2.1); pillarShape.lineTo(-1.05, -2.1); pillarShape.lineTo(-1.05, -2.32);
    const pillarGeo = new THREE.ExtrudeGeometry(pillarShape, extrudeSettings); const pillar = new THREE.Mesh(pillarGeo, logoMaterial); pillar.position.set(0.1, 0, -0.06);

    const dotShape = new THREE.Shape(); dotShape.absarc(0, 0, 0.38, 0, Math.PI * 2, false);
    const dotGeo = new THREE.ExtrudeGeometry(dotShape, extrudeSettings); const dot = new THREE.Mesh(dotGeo, logoMaterial); dot.position.set(2.1, -1.95, -0.06);

    logoInner.add(slash, phiRing, pillar, dot); logoGroup.add(logoInner); logoGroup.scale.set(0, 0, 0); scene.add(logoGroup);

    const shapes = { eye: eyeGroup, torus: torusGroup, pawn: pawnGroup, logo: logoGroup };

    Object.values(shapes).forEach(shape => shape.userData = { targetScale: 0, baseRotationY: 0 });
    shapes['eye'].userData.targetScale = 1;

    window.switchShape = (target) => {
        if (currentShape === target) return;
        shapes[currentShape].userData.targetScale = 0;
        const isMobile = window.innerWidth < 768;
        shapes[target].userData.targetScale = (target === 'eye' && isMobile) ? 0.55 : 1;
        currentShape = target;
    };

    const handleResize = () => {
        width = window.innerWidth; height = window.innerHeight;
        const isMobile = width < 768;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        charWidth = 6; charHeight = 10;
        if (currentShape === 'eye') { shapes['eye'].userData.targetScale = isMobile ? 0.55 : 1; }

        canvas.width = width * dpr; canvas.height = height * dpr; ctx.scale(dpr, dpr);
        columns = Math.ceil(width / charWidth); rows = Math.ceil(height / charHeight);
        camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(columns, rows, false);

        const totalCells = columns * rows; pixelBuffer = new Uint8Array(totalCells * 4);
        colX = new Float32Array(columns); rowY = new Float32Array(rows);
        for (let i = 0; i < columns; i++) colX[i] = i * charWidth + charWidth / 2;
        for (let j = 0; j < rows; j++) rowY[j] = j * charHeight + charHeight / 2;

        hashGrid = new Float32Array(totalCells); noise1_sin_x = new Float32Array(columns); noise1_cos_x = new Float32Array(columns); noise2_sin_y = new Float32Array(rows); noise2_cos_y = new Float32Array(rows); noise3_sin_xy = new Float32Array(totalCells); noise3_cos_xy = new Float32Array(totalCells); noise4_sin_xy = new Float32Array(totalCells); noise4_cos_xy = new Float32Array(totalCells);

        for (let i = 0; i < columns; i++) { noise1_sin_x[i] = Math.sin(colX[i] * 0.015); noise1_cos_x[i] = Math.cos(colX[i] * 0.015); }
        for (let j = 0; j < rows; j++) { noise2_sin_y[j] = Math.sin(rowY[j] * 0.015); noise2_cos_y[j] = Math.cos(rowY[j] * 0.015); }
        for (let j = 0; j < rows; j++) {
            const rowOffset = j * columns;
            for (let i = 0; i < columns; i++) {
                const idx = rowOffset + i; const x = colX[i]; const y = rowY[j];
                hashGrid[idx] = Math.abs(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1;
                noise3_sin_xy[idx] = Math.sin((x + y) * 0.025); noise3_cos_xy[idx] = Math.cos((x + y) * 0.025);
                noise4_sin_xy[idx] = Math.sin((x - y) * 0.02); noise4_cos_xy[idx] = Math.cos((x - y) * 0.02);
            }
        }
        bucketX = Array(56).fill(0).map(() => new Float32Array(totalCells));
        bucketY = Array(56).fill(0).map(() => new Float32Array(totalCells));
        bucketChars = Array(56).fill(0).map(() => new Array(totalCells));
        ctx.font = 'bold 12px "Courier New", Courier, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    };

    const handleScroll = () => { scrollY = window.scrollY; };

    window.addEventListener('touchstart', (e) => {
        isInteracting = true; lastTouchTime = Date.now(); mouse.tx = e.touches[0].clientX; mouse.ty = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (isInteracting) { lastTouchTime = Date.now(); mouse.tx = e.touches[0].clientX; mouse.ty = e.touches[0].clientY; }
    }, { passive: true });

    let resizeTimeout;
    window.addEventListener('resize', () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(handleResize, 150); });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', (e) => { mouse.tx = e.clientX; mouse.ty = e.clientY; });
    handleResize();

    let blinkTimer = 0; let isBlinking = false; let skip = 0;

    const animate = (timestamp) => {
        animationFrameId = requestAnimationFrame(animate);
        const isMobile = width < 768; const time = timestamp * 0.001 || 0;

        if (isMobile) {
            if (skip++ % 2 === 0) return;
            const breatheRadius = width * 0.25;
            focalX = width / 2 + Math.cos(time * 0.5) * breatheRadius; focalY = height / 2 + Math.sin(time * 0.8) * breatheRadius;
            if (Date.now() - lastTouchTime > IDLE_RETURN_TIME) { isInteracting = false; }
            if (!isInteracting) { mouse.tx = width / 2 + Math.cos(time * 0.3) * (width * 0.15); mouse.ty = height / 2 + Math.sin(time * 0.4) * (height * 0.15); }
        } else {
            focalX = mouse.x; focalY = mouse.y;
        }

        mouse.x += (mouse.tx - mouse.x) * 0.25; mouse.y += (mouse.ty - mouse.y) * 0.25;
        const tXNorm = (mouse.x / width) * 2 - 1; const tYNorm = -(mouse.y / height) * 2 + 1;
        const scrollRatio = Math.max(0, scrollY / height); const scrollFade = Math.max(0, 1 - scrollRatio * 0.5);
        const fov = camera.fov * (Math.PI / 180); const visibleHeightAtZ = 2 * Math.tan(fov / 2) * camera.position.z;
        const scrollOffsetWorld = (scrollY / height) * visibleHeightAtZ; const mobileYOffset = (width < 768) ? 1.5 : 0;
        const finalX = 3.7; const finalY = 1.3; const finalSize = 0.7;

        const p = window.eyeDockState ? window.eyeDockState.progress : 0; const invP = 1 - p;

        Object.values(shapes).forEach(obj => {
            const baseScale = obj.userData.targetScale * (isMobile ? scrollFade : 1.0);
            const targetScale = isMobile ? baseScale : baseScale * (invP + (p * finalSize));
            let scaleY = (obj === eyeGroup && isBlinking) ? 0.05 : targetScale;
            obj.scale.x += (targetScale - obj.scale.x) * 0.1; obj.scale.y += (scaleY - obj.scale.y) * 0.15; obj.scale.z += (targetScale - obj.scale.z) * 0.1;
            const tilt = (obj === logoGroup) ? 0.2 : 0.8;
            obj.rotation.y += ((tXNorm * tilt + obj.userData.baseRotationY) - obj.rotation.y) * 0.25; obj.rotation.x += (-tYNorm * tilt - obj.rotation.x) * 0.25;
            const floatY = Math.sin(time * 1.5) * 0.2;

            if (isMobile) {
                obj.position.x = 0; obj.position.y = floatY + (scrollOffsetWorld * 0.65) + mobileYOffset;
            } else {
                obj.position.x = finalX * p;
                const parallaxY = scrollOffsetWorld * 0.65; const dockedY = scrollOffsetWorld - visibleHeightAtZ + finalY;
                obj.position.y = floatY + (parallaxY * invP) + (dockedY * p);
            }
        });

        if (currentShape === 'eye') {
            blinkTimer++;
            if (blinkTimer > 150) { if (Math.random() > 0.7) { isBlinking = true; setTimeout(() => { isBlinking = false; }, 150); } blinkTimer = 0; }
        }

        renderer.clear(); renderer.render(scene, camera); const gl = renderer.getContext();
        gl.readPixels(0, 0, columns, rows, gl.RGBA, gl.UNSIGNED_BYTE, pixelBuffer);
        ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, width, height);

        const t1 = time, t2 = -time, t3 = time * 1.2, t4 = -time * 0.8;
        const sinT1 = Math.sin(t1), cosT1 = Math.cos(t1); const sinT2 = Math.sin(t2), cosT2 = Math.cos(t2);
        const sinT3 = Math.sin(t3), cosT3 = Math.cos(t3); const sinT4 = Math.sin(t4), cosT4 = Math.cos(t4);
        const invMaxRadius = 1.0 / Math.min(400, Math.max(width, height) * 0.35);

        bucketCounts.fill(0);

        for (let j = 0; j < rows; j++) {
            const webglY = rows - 1 - j; const rowOffset = j * columns; const y = rowY[j];
            const dy = y - focalY; const dySq = dy * dy;

            for (let i = 0; i < columns; i++) {
                const idx = rowOffset + i; const x = colX[i]; const pxIdx = (webglY * columns + i) * 4;
                let alphaToDraw = isMobile ? (1.0 * Math.min(1, scrollFade * 1.5)) : 1.0;
                let charToDraw = ''; let shapeOffset = 0;

                if (pixelBuffer[pxIdx + 3] > 10) {
                    const r = pixelBuffer[pxIdx]; const g = pixelBuffer[pxIdx + 1]; const b = pixelBuffer[pxIdx + 2];
                    const maxVal = Math.max(r, g, b);

                    if (g > r + 30 && g > b + 30) { shapeOffset = 11; } else if (b > r + 30 && b > g + 30) { shapeOffset = 22; } else if (r > g + 30 && b > g + 30) { shapeOffset = 33; }

                    let finalLum = maxVal + BAYER[(webglY % 4) * 4 + (i % 4)] * 64;
                    if (finalLum < 0) finalLum = 0; else if (finalLum > 255) finalLum = 255;
                    charToDraw = SHAPE_CHARS[Math.floor(finalLum * 0.00392156 * SHAPE_CHARS_LEN)];
                    alphaToDraw = isMobile ? Math.min(1, scrollFade * 1.5) : 1.0;
                } else {
                    const dx = x - focalX; let distance = Math.sqrt(dx * dx + dySq);
                    const v1 = noise1_sin_x[i] * cosT1 + noise1_cos_x[i] * sinT1; const v2 = noise2_sin_y[j] * cosT2 + noise2_cos_y[j] * sinT2;
                    const v3 = noise3_sin_xy[idx] * cosT3 + noise3_cos_xy[idx] * sinT3; const v4 = noise4_cos_xy[idx] * cosT4 - noise4_sin_xy[idx] * sinT4;
                    distance += (v1 + v2 + v3 + v4) * 25;

                    let intensity = 1.0 - (distance * invMaxRadius);
                    if (intensity > 0) {
                        let mixedIntensity = intensity + (hashGrid[idx] * 0.3 - 0.15);
                        if (mixedIntensity < 0) mixedIntensity = 0; else if (mixedIntensity > 1) mixedIntensity = 1;
                        charToDraw = HOVER_CHARS[Math.floor(mixedIntensity * HOVER_CHARS_LEN)];
                        alphaToDraw = mixedIntensity * 0.3;
                        if (alphaToDraw > 0.15) alphaToDraw = 0.15;
                    }
                }

                if (alphaToDraw > 0) {
                    let bucketIndex = Math.round(alphaToDraw * 10);
                    if (pixelBuffer[pxIdx + 3] > 10) { bucketIndex += 11 + shapeOffset; }
                    if (bucketIndex > 0 && bucketIndex < 56) {
                        const count = bucketCounts[bucketIndex];
                        bucketX[bucketIndex][count] = x; bucketY[bucketIndex][count] = y; bucketChars[bucketIndex][count] = charToDraw; bucketCounts[bucketIndex]++;
                    }
                }
            }
        }

        for (let k = 1; k < 56; k++) {
            const count = bucketCounts[k];
            if (count === 0) continue;
            if (k < 11) { ctx.fillStyle = ALPHA_STYLES[k]; } else if (k < 22) { ctx.fillStyle = EYE_STYLES[k - 11]; } else if (k < 33) { ctx.fillStyle = TORUS_STYLES[k - 22]; } else if (k < 44) { ctx.fillStyle = PAWN_STYLES[k - 33]; } else { ctx.fillStyle = LOGO_STYLES[k - 44]; }
            const bx = bucketX[k]; const by = bucketY[k]; const bc = bucketChars[k];
            for (let m = 0; m < count; m++) { ctx.fillText(bc[m], bx[m], by[m]); }
        }
    };
    animate(0);

    // Eventos de interactividad para cambiar figuras atados y encapsulados aquí
    document.querySelectorAll('.interactive-phrase[data-shape]').forEach(el => {
        el.addEventListener('mouseenter', () => window.switchShape(el.dataset.shape));
        el.addEventListener('mouseleave', () => window.switchShape('eye'));
    });
}