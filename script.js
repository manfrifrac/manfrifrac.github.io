document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollTrigger);

    // ================== UX: PRELOADER E CURSORE ==================
    let progress = 0;
    const preloaderText = document.querySelector('.preloader-text');
    const preloader = document.querySelector('.preloader');
    
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 5) + 1;
        if (progress > 100) progress = 100;
        preloaderText.innerText = progress;
        
        if (progress === 100) {
            clearInterval(interval);
            gsap.to(preloader, {
                yPercent: -100, duration: 1.2, ease: "power4.inOut", delay: 0.2,
                onComplete: () => {
                    gsap.fromTo(".gsap-reveal", 
                        { y: 50, opacity: 0 },
                        { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power3.out" }
                    );
                }
            });
        }
    }, 20);

    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let outlineX = mouseX, outlineY = mouseY;
    let targetX = 0, targetY = 0;
    let mouseVelocity = 0, lastMouseX = mouseX, lastMouseY = mouseY;
    const windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        cursorDot.style.left = `${mouseX}px`; cursorDot.style.top = `${mouseY}px`;
        targetX = (mouseX - windowHalfX); targetY = (mouseY - windowHalfY);
        
        // Testo magnetico 3D
        const tiltX = (e.clientX / window.innerWidth) - 0.5;
        const tiltY = (e.clientY / window.innerHeight) - 0.5;
        gsap.to('.fixed-info', { rotationY: tiltX * 15, rotationX: -tiltY * 15, transformPerspective: 1000, duration: 1 });
    });

    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => cursorOutline.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => cursorOutline.classList.remove('cursor-hover'));
    });

    const renderCursor = () => {
        outlineX += (mouseX - outlineX) * 0.15; outlineY += (mouseY - outlineY) * 0.15;
        cursorOutline.style.left = `${outlineX}px`; cursorOutline.style.top = `${outlineY}px`;
        const dx = mouseX - lastMouseX; const dy = mouseY - lastMouseY;
        mouseVelocity = Math.sqrt(dx * dx + dy * dy);
        lastMouseX = mouseX; lastMouseY = mouseY;
        requestAnimationFrame(renderCursor);
    };
    renderCursor();

    let scrollVelocity = 0, lastScrollY = window.scrollY, globalScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        scrollVelocity = Math.abs(currentScroll - lastScrollY);
        lastScrollY = currentScroll; globalScrollY = currentScroll;
    });

    // ==============================================================================
    // ================== WEBGL: THE ORGANIC PARALLAX ECOSYSTEM =====================
    // ==============================================================================

    const container = document.getElementById('webgl-container');
    const scene = new THREE.Scene();
    
    // Nebbia volumetrica nerissima
    scene.fog = new THREE.FogExp2(0x080808, 0.02);
    
    // Telecamera (viaggerà da y=0 a y=-30)
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 8;
    camera.position.y = 0; 

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x080808, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    const composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    const rgbShiftPass = new THREE.ShaderPass(THREE.RGBShiftShader);
    rgbShiftPass.uniforms['amount'].value = 0.0015;
    composer.addPass(rgbShiftPass);

    // ================== LUCI DA STUDIO FOTOGRAFICO ==================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Luci mobili colorate per far rifrangere il vetro
    const neonRed = new THREE.PointLight(0xff2244, 5, 20);
    const neonBlue = new THREE.PointLight(0x2266ff, 5, 20);
    scene.add(neonRed);
    scene.add(neonBlue);

    // ================== LAYER 1 (DEEP BACKGROUND): IL TUNNEL DI FIBONACCI ==================
    // Z = -5 a -15 (Avvolge la telecamera durante tutta la discesa)
    const dustCount = 8000;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustRand = new Float32Array(dustCount);
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    
    for(let i=0; i<dustCount; i++) {
        const theta = i * Math.PI * 2 * goldenRatio; // Matematica della Sezione Aurea
        const yPos = 15 - (i / dustCount) * 60; // Scende lungo tutta l'altezza del sito
        // Raggio largo per creare un tunnel organico attorno alla telecamera
        const radius = 10 + Math.sin(i * 0.05) * 2; 
        
        dustPos[i*3] = Math.cos(theta) * radius;
        dustPos[i*3+1] = yPos;
        dustPos[i*3+2] = Math.sin(theta) * radius - 5;
        dustRand[i] = Math.random();
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('aRandom', new THREE.BufferAttribute(dustRand, 1));

    const dustMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0xaabbcc) } },
        vertexShader: `
            uniform float uTime;
            attribute float aRandom;
            void main() {
                vec3 pos = position;
                pos.x += sin(uTime * 0.5 + aRandom * 10.0) * 0.5;
                pos.y += cos(uTime * 0.3 + aRandom * 10.0) * 0.5;
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = (3.0 * aRandom + 1.0) * (30.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            void main() {
                float dist = distance(gl_PointCoord, vec2(0.5));
                if(dist > 0.5) discard;
                gl_FragColor = vec4(uColor, (0.5 - dist) * 1.5);
            }
        `,
        transparent: true, depthWrite: false, blending: THREE.NormalBlending
    });
    const dustMesh = new THREE.Points(dustGeo, dustMat);
    scene.add(dustMesh);

    // ================== LAYER 2: THE DNA DOUBLE HELIX (Spina Dorsale) ==================
    // Struttura a doppia elica che scende in profondità
    const curvePoints1 = [];
    const curvePoints2 = [];
    const curveLength = 300;
    
    for(let i=0; i<curveLength; i++) {
        const t = i / curveLength;
        const yPos = 15 - (t * 60); // Scende da y=15 a y=-45
        
        const radius = 1.8; // Raggio dell'elica
        const twists = 10; // Numero di avvolgimenti
        const angle1 = t * Math.PI * 2 * twists;
        const angle2 = angle1 + Math.PI; // Lato opposto per la doppia elica
        
        // Movimento serpeggiante naturale dell'intera struttura
        const driftX = Math.sin(t * Math.PI * 3) * 2;
        const driftZ = Math.cos(t * Math.PI * 2) * 2;

        curvePoints1.push(new THREE.Vector3(driftX + Math.cos(angle1) * radius, yPos, driftZ + Math.sin(angle1) * radius));
        curvePoints2.push(new THREE.Vector3(driftX + Math.cos(angle2) * radius, yPos, driftZ + Math.sin(angle2) * radius));
    }
    
    const organicCurve1 = new THREE.CatmullRomCurve3(curvePoints1);
    const organicCurve2 = new THREE.CatmullRomCurve3(curvePoints2);
    organicCurve1.tension = 0.5; organicCurve2.tension = 0.5;

    const liquidSilverMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff, metalness: 0.2, roughness: 0.1,
        transmission: 1.0, ior: 1.5, thickness: 1.5,
        clearcoat: 1.0, clearcoatRoughness: 0.1
    });

    const dnaStrand1 = new THREE.Mesh(new THREE.TubeGeometry(organicCurve1, 300, 0.25, 12, false), liquidSilverMat);
    const dnaStrand2 = new THREE.Mesh(new THREE.TubeGeometry(organicCurve2, 300, 0.25, 12, false), liquidSilverMat);
    scene.add(dnaStrand1);
    scene.add(dnaStrand2);

    // ================== LAYER EXTRA: SUNFLOWER PHYLLOTAXIS (Sfondo 2D Mandala) ==================
    // Numero di cerchi ridotto e sparsi per evidenziare le spirali matematiche (Mandala)
    const fibCount = 800; // Ridotto per non affollare la vista
    const fibGeo = new THREE.BufferGeometry();
    const fibPos = new Float32Array(fibCount * 3);
    const fibIndex = new Float32Array(fibCount);
    const fibRand = new Float32Array(fibCount); 
    
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); 
    
    for(let i=0; i<fibCount; i++) {
        // Distanza dal centro aumentata significativamente per creare "aria" tra le spirali
        const radius = Math.sqrt(i) * 1.5; 
        const theta = i * goldenAngle;
        
        fibPos[i*3] = Math.cos(theta) * radius;
        fibPos[i*3+1] = Math.sin(theta) * radius;
        fibPos[i*3+2] = 0; // Rigorosamente piatto (2D)
        fibIndex[i] = i; 
        fibRand[i] = Math.random(); 
    }
    fibGeo.setAttribute('position', new THREE.BufferAttribute(fibPos, 3));
    fibGeo.setAttribute('aIndex', new THREE.BufferAttribute(fibIndex, 1));
    fibGeo.setAttribute('aRandom', new THREE.BufferAttribute(fibRand, 1));

    const fibMat = new THREE.ShaderMaterial({
        uniforms: { 
            uTime: { value: 0 }, 
            uScroll: { value: 0 }, 
            uColor: { value: new THREE.Color(0xffffff) } 
        },
        vertexShader: `
            uniform float uScroll;
            attribute float aIndex;
            attribute float aRandom;
            varying float vRandom;
            void main() {
                vRandom = aRandom;
                vec3 pos = position;
                
                // Mappiamo l'animazione di 800 semi lungo l'intero scroll
                float spawnScroll = aIndex * 0.035; 
                float progress = clamp((uScroll - spawnScroll) * 0.5, 0.0, 1.0);
                
                float easeOut = 1.0 - pow(1.0 - progress, 3.0);
                pos.xy *= easeOut;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                // Anelli molto più larghi per incastrarsi in un Mandala
                gl_PointSize = 3500.0 / -mvPosition.z * easeOut;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            varying float vRandom;
            void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                
                // Anelli sottilissimi e delicati: per creare la geometria sacra senza appesantire
                float ring = smoothstep(0.49, 0.47, dist) * smoothstep(0.45, 0.47, dist);
                
                vec3 tileColor = mix(vec3(0.95), vec3(1.0), vRandom);
                
                if(dist > 0.5) discard;
                
                gl_FragColor = vec4(tileColor, ring * 1.5); // Boost luminosità per contrasto netto con mix-blend-mode
            }
        `,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    // Calcoliamo la larghezza del campo visivo per posizionare il Mandala a destra
    function getRightEdgeX() {
        const dist = 30; // Distanza assoluta (camera Z = 0 locale, mandala Z = -30)
        const vFov = (camera.fov * Math.PI) / 180;
        const height = 2 * Math.tan(vFov / 2) * dist;
        const width = height * camera.aspect;
        return width / 2;
    }
    
    const fibonacciMesh = new THREE.Points(fibGeo, fibMat);
    // Agganciamo il girasole direttamente alla telecamera per farlo comportare come un Wallpaper 2D
    // Lo posizioniamo esattamente sul lato destro (così appare solo una metà)
    fibonacciMesh.position.set(getRightEdgeX(), 0, -30); 
    camera.add(fibonacciMesh);

    // ================== LAYER EXTRA: LE STELLE (Deep Background) ==================
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 3000;
    const starsPos = new Float32Array(starsCount * 3);
    for(let i=0; i<starsCount; i++) {
        starsPos[i*3] = (Math.random() - 0.5) * 200; // X spread
        starsPos[i*3+1] = (Math.random() - 0.5) * 200; // Y spread
        starsPos[i*3+2] = (Math.random() - 0.5) * 50 - 50; // Z spread: Dietro il girasole (da -50 a -100)
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.6 });
    const starsMesh = new THREE.Points(starsGeo, starsMat);
    camera.add(starsMesh);

    // ================== LAYER EXTRA: INFIPRESCENZA / LUMINESCENZA ==================
    // Una nebulosa brillante situata ESATTAMENTE tra le stelle (-50) e il girasole (-30)
    const phosGeo = new THREE.BufferGeometry();
    const phosCount = 800;
    const phosPos = new Float32Array(phosCount * 3);
    for(let i=0; i<phosCount; i++) {
        phosPos[i*3] = (Math.random() - 0.5) * 120;
        phosPos[i*3+1] = (Math.random() - 0.5) * 120;
        phosPos[i*3+2] = (Math.random() - 0.5) * 10 - 40; // Z spread: Tra -35 e -45 (Tra girasole e stelle)
    }
    phosGeo.setAttribute('position', new THREE.BufferAttribute(phosPos, 3));
    
    // Shader per la luminescenza morbida (glow)
    const phosMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0x0055ff) } }, // Blu elettrico/neon
        vertexShader: `
            uniform float uTime;
            void main() {
                vec3 pos = position;
                // Leggero movimento orbitale per la nebbia luminosa
                pos.x += sin(uTime + pos.y * 0.1) * 2.0;
                pos.y += cos(uTime + pos.x * 0.1) * 2.0;
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = 40.0 / -mvPosition.z; // Punti larghi per effetto sfocato
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            void main() {
                // Sfumatura radiale morbidissima
                float dist = distance(gl_PointCoord, vec2(0.5));
                float alpha = exp(-dist * 4.0); // Esponenziale per glow realistico
                if(dist > 0.5) discard;
                gl_FragColor = vec4(uColor, alpha * 0.3);
            }
        `,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const phosMesh = new THREE.Points(phosGeo, phosMat);
    camera.add(phosMesh);

    scene.add(camera); // Necessario per visualizzare oggetti figli della telecamera



    // ================== LAYER 3 (FOREGROUND): DETRITI GEOMETRICI ==================
    // Z = 3 a 6 (Vicinissimi, sfuggono via velocemente allo scroll)
    const debrisGroup = new THREE.Group();
    const debrisGeo = new THREE.IcosahedronGeometry(0.5, 0); // Poligonale (Low poly per contrasto)
    const debrisMat = new THREE.MeshPhysicalMaterial({
        color: 0x111111, // Ossidiana scura
        metalness: 0.5, roughness: 0.2,
        transmission: 0.8, thickness: 1.0
    });

    for(let i=0; i<30; i++) {
        const mesh = new THREE.Mesh(debrisGeo, debrisMat);
        
        // Distribuzione dei frammenti frontali usando Phyllotaxis (Fibonacci)
        const theta = i * Math.PI * 2 * goldenRatio;
        const radius = 3 + (i * 0.1); 
        const yPos = 5 - (i * 1.5); // Spalmati verticalmente
        
        mesh.position.set(
            Math.cos(theta) * radius,
            yPos,
            2 + Math.random() * 3   // Vicinissimi alla camera
        );
        mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
        mesh.userData = {
            rx: (Math.random() - 0.5) * 0.05,
            ry: (Math.random() - 0.5) * 0.05
        };
        debrisGroup.add(mesh);
    }
    scene.add(debrisGroup);

    // ================== GSAP CAMERA PARALLAX SCROLL ==================
    // Il cuore del parallasse: scendiamo vertiginosamente verso il basso
    gsap.to(camera.position, {
        y: -30,
        ease: "none",
        scrollTrigger: {
            trigger: ".scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        }
    });

    const clock = new THREE.Clock();
    const animate = () => {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // 1. Anima Polvere (Slow Parallax naturale)
        dustMat.uniforms.uTime.value = t;

        // 2. Anima Spina Dorsale Organica (Rotazione legata al mouse per interazione)
        dnaStrand1.rotation.y = (targetX * 0.0005) + Math.sin(t * 0.1) * 0.1;
        dnaStrand1.rotation.x = (targetY * 0.0005) + Math.cos(t * 0.1) * 0.1;
        dnaStrand2.rotation.y = (targetX * 0.0005) + Math.sin(t * 0.1) * 0.1;
        dnaStrand2.rotation.x = (targetY * 0.0005) + Math.cos(t * 0.1) * 0.1;

        // Anima Sfondo 2D a Piastrelle (Girasole)
        fibMat.uniforms.uScroll.value = Math.abs(camera.position.y); 
        fibonacciMesh.rotation.z = globalScrollY * 0.0002;
        
        // Anima Stelle e Fosforescenza (Infiprescrenza)
        starsMesh.rotation.z = t * 0.01; // Le stelle ruotano lentissimamente
        phosMat.uniforms.uTime.value = t;
        phosMesh.rotation.z = -t * 0.02; // La nebulosa ruota in senso inverso

        // 3. Anima Detriti Foreground
        debrisGroup.children.forEach(debris => {
            debris.rotation.x += debris.userData.rx;
            debris.rotation.y += debris.userData.ry;
        });

        // 4. Luci Dinamiche (seguono la discesa della telecamera per illuminare la scena)
        neonRed.position.x = Math.sin(t) * 4;
        neonRed.position.y = camera.position.y + Math.cos(t * 1.5) * 3;
        neonRed.position.z = Math.cos(t) * 2;

        neonBlue.position.x = Math.cos(t * 1.2) * 4;
        neonBlue.position.y = camera.position.y + Math.sin(t * 0.8) * 3;
        neonBlue.position.z = Math.sin(t * 1.2) * 2;

        // 5. Aberrazione Cromatica (Reattiva allo scroll)
        let targetRGB = 0.001 + (mouseVelocity * 0.0001) + (scrollVelocity * 0.0002);
        rgbShiftPass.uniforms['amount'].value += (targetRGB - rgbShiftPass.uniforms['amount'].value) * 0.1;
        mouseVelocity *= 0.9; scrollVelocity *= 0.9;

        composer.render();
    };
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Mantiene il Mandala ancorato al bordo destro dello schermo durante il resize
        if (typeof fibonacciMesh !== 'undefined' && typeof getRightEdgeX === 'function') {
            fibonacciMesh.position.x = getRightEdgeX();
        }
        composer.setSize(window.innerWidth, window.innerHeight);
    });

});
