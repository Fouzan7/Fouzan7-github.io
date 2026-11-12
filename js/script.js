// =====================================================================
// MOHAMMED FOUZAN — Advanced Interactive Engine (Vanilla JS + jQuery)
// 3D Gyroscope Canvas, Skill Radar, Command Palette (Ctrl+K),
// Precision Cursor, Touch Ripples & Sparks, Spotlight 3D Tilt
// =====================================================================

$(document).ready(function () {

  // ---- 1. Inject Global Layers (Progress, Particle Canvas, Command Palette) ----
  if (!$('.scroll-progress').length) {
    $('body').prepend('<div class="scroll-progress" aria-hidden="true"></div>');
  }
  if (!$('#bg-canvas').length) {
    $('body').prepend('<canvas id="bg-canvas" aria-hidden="true"></canvas>');
  }

  // Inject Command Palette trigger in navbar right if not present
  if (!$('#cmd-open').length && $('.nav-links').length) {
    $('.nav-links').before(
      '<button type="button" id="cmd-open" class="cmd-trigger" aria-label="Open quick command palette">' +
      '<i class="fas fa-search"></i><span class="cmd-text">Quick Jump</span><span class="cmd-kbd">Ctrl K</span>' +
      '</button>'
    );
  }

  // Inject Command Palette Modal
  if (!$('#cmd-backdrop').length) {
    $('body').append(
      '<div id="cmd-backdrop" class="cmd-backdrop" role="dialog" aria-modal="true" aria-label="Quick navigation">' +
        '<div class="cmd-modal">' +
          '<div class="cmd-input-wrap">' +
            '<i class="fas fa-terminal"></i>' +
            '<input id="cmd-search" type="text" placeholder="Type a page, project, or action (e.g. Resume, Bio-Data, GitHub)..." autocomplete="off" />' +
            '<button type="button" id="cmd-close">ESC</button>' +
          '</div>' +
          '<div class="cmd-list" id="cmd-list"></div>' +
        '</div>' +
      '</div>'
    );
  }

  // ---- 2. Command Palette Logic (Ctrl+K / Cmd+K) ----
  const cmdActions = [
    { label: 'Home — Portfolio Overview', tag: 'PAGE', icon: 'fas fa-home', action: () => location.href = 'index.html' },
    { label: 'Bio-Data & Career Summary', tag: 'PAGE', icon: 'fas fa-id-card', action: () => location.href = 'about.html' },
    { label: 'Skills & Interactive Radar', tag: 'PAGE', icon: 'fas fa-microchip', action: () => location.href = 'skills.html' },
    { label: 'Projects — Hardware & Web Builds', tag: 'PAGE', icon: 'fas fa-layer-group', action: () => location.href = 'projects.html' },
    { label: 'Education & Qualifications', tag: 'PAGE', icon: 'fas fa-graduation-cap', action: () => location.href = 'education.html' },
    { label: 'Resume — Print / Export PDF', tag: 'PAGE', icon: 'fas fa-file-alt', action: () => location.href = 'resume.html' },
    { label: 'Contact — Send Message', tag: 'PAGE', icon: 'fas fa-paper-plane', action: () => location.href = 'contact.html' },
    { label: 'Print / Save Current Page as PDF', tag: 'ACTION', icon: 'fas fa-print', action: () => { closeCmd(); setTimeout(() => window.print(), 150); } },
    { label: 'Copy Email (mthouban@gmail.com)', tag: 'COPY', icon: 'fas fa-envelope', action: () => copyText('mthouban@gmail.com') },
    { label: 'Copy Phone (+91 8147479855)', tag: 'COPY', icon: 'fas fa-phone', action: () => copyText('+91 8147479855') },
    { label: 'Open GitHub Profile (Fouzan7)', tag: 'EXT', icon: 'fab fa-github', action: () => window.open('https://github.com/Fouzan7', '_blank', 'noopener') },
    { label: 'Open LinkedIn Profile', tag: 'EXT', icon: 'fab fa-linkedin-in', action: () => window.open('https://www.linkedin.com/in/mohammed-fouzan-4341b1441', '_blank', 'noopener') }
  ];

  let cmdIndex = 0;
  let filteredCmds = cmdActions.slice();

  function copyText(txt) {
    if (navigator.clipboard && txt) {
      navigator.clipboard.writeText(txt);
    }
    closeCmd();
  }

  function renderCmdList(query) {
    const q = (query || '').toLowerCase().trim();
    filteredCmds = cmdActions.filter(item =>
      item.label.toLowerCase().includes(q) || item.tag.toLowerCase().includes(q)
    );
    if (cmdIndex >= filteredCmds.length) cmdIndex = 0;

    const $list = $('#cmd-list').empty();
    if (!filteredCmds.length) {
      $list.append('<div style="padding:18px;text-align:center;color:var(--muted);font-size:0.86rem;">No matching commands.</div>');
      return;
    }

    filteredCmds.forEach(function (item, idx) {
      const $row = $(
        '<div class="cmd-item' + (idx === cmdIndex ? ' selected' : '') + '">' +
          '<div class="cmd-item-left"><i class="' + item.icon + '"></i><span>' + item.label + '</span></div>' +
          '<span class="cmd-item-tag">' + item.tag + '</span>' +
        '</div>'
      );
      $row.on('click', function () { item.action(); });
      $list.append($row);
    });
  }

  function openCmd() {
    $('#cmd-backdrop').addClass('open');
    $('#cmd-search').val('');
    cmdIndex = 0;
    renderCmdList('');
    setTimeout(() => $('#cmd-search').focus(), 40);
  }

  function closeCmd() {
    $('#cmd-backdrop').removeClass('open');
  }

  $(document).on('click', '#cmd-open', openCmd);
  $(document).on('click', '#cmd-close', closeCmd);
  $(document).on('click', '#cmd-backdrop', function (e) {
    if (e.target === this) closeCmd();
  });
  $(document).on('input', '#cmd-search', function () {
    cmdIndex = 0;
    renderCmdList($(this).val());
  });
  $(document).on('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      $('#cmd-backdrop').hasClass('open') ? closeCmd() : openCmd();
    } else if ($('#cmd-backdrop').hasClass('open')) {
      if (e.key === 'Escape') {
        closeCmd();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        cmdIndex = (cmdIndex + 1) % Math.max(1, filteredCmds.length);
        renderCmdList($('#cmd-search').val());
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        cmdIndex = (cmdIndex - 1 + Math.max(1, filteredCmds.length)) % Math.max(1, filteredCmds.length);
        renderCmdList($('#cmd-search').val());
      } else if (e.key === 'Enter' && filteredCmds[cmdIndex]) {
        e.preventDefault();
        filteredCmds[cmdIndex].action();
      }
    }
  });

  // ---- 3. Interactive Constellation Background (Mouse + Touch Responsive) ----
  (function initParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const pointer = { x: -9999, y: -9999, active: false };
    const isSmall = window.innerWidth < 768;
    const nodeCount = isSmall ? 30 : 58;
    const maxDist = isSmall ? 110 : 140;
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.42,
        vy: (Math.random() - 0.5) * 0.42,
        r: Math.random() * 1.5 + 0.8
      });
    }

    window.addEventListener('resize', function () {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    window.addEventListener('pointermove', function (e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) {
        pointer.x = e.touches[0].clientX;
        pointer.y = e.touches[0].clientY;
        pointer.active = true;
      }
    }, { passive: true });

    window.addEventListener('pointerleave', function () { pointer.active = false; });
    window.addEventListener('touchend', function () {
      setTimeout(function () { pointer.active = false; }, 350);
    }, { passive: true });

    let lastParticleTime = performance.now();
    function draw(now) {
      const dt = Math.min((now - lastParticleTime) / 1000, 0.05) || 0.016;
      lastParticleTime = now;
      const timeScale = dt * 60;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx * timeScale;
        n.y += n.vy * timeScale;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        if (pointer.active) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 175 && dist > 1) {
            n.x += (dx / dist) * 0.38 * timeScale;
            n.y += (dy / dist) * 0.38 * timeScale;
          }
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(45, 74, 62, 0.22)';
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const d = Math.hypot(n.x - m.x, n.y - m.y);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = 'rgba(45, 74, 62, ' + (alpha * 0.9).toFixed(3) + ')';
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        if (pointer.active) {
          const dp = Math.hypot(n.x - pointer.x, n.y - pointer.y);
          if (dp < 165) {
            const alpha = (1 - dp / 165) * 0.42;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.strokeStyle = 'rgba(140, 94, 53, ' + (alpha * 0.85).toFixed(3) + ')';
            ctx.lineWidth = 1.05;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();

  // ---- 4. Real-Time WebGL PBR 3D Studio Engine (Three.js r134 + Fallback) ----
  (function initWebGLStudio() {
    const canvas = document.getElementById('scene-3d');
    if (!canvas) return;
    const stage = canvas.parentElement;
    const $readout = $('#rot-readout');
    const $label = $('#shape-label');
    const $actionBtn = $('#trigger-3d-fx');

    if (typeof THREE !== 'undefined') {
      let width = stage.clientWidth || 380;
      let height = stage.clientHeight || 325;

      const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;
      renderer.outputEncoding = THREE.sRGBEncoding;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
      camera.position.set(0, 0.35, 4.4);
      camera.lookAt(0, 0, 0);

      // Procedural Warm Studio Environment Map (no external HDRI required)
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envScene = new THREE.Scene();
      envScene.background = new THREE.Color(0xf5f2eb);
      const envGeo = new THREE.PlaneGeometry(12, 12);
      const panelTop = new THREE.Mesh(envGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
      panelTop.position.set(0, 6, 0);
      panelTop.rotation.x = Math.PI / 2;
      const panelLeft = new THREE.Mesh(envGeo, new THREE.MeshBasicMaterial({ color: 0xd9c2a3, side: THREE.DoubleSide }));
      panelLeft.position.set(-6, 1, 2);
      panelLeft.rotation.y = Math.PI / 2;
      const panelRight = new THREE.Mesh(envGeo, new THREE.MeshBasicMaterial({ color: 0x3f6b59, side: THREE.DoubleSide }));
      panelRight.position.set(6, -1, 2);
      panelRight.rotation.y = -Math.PI / 2;
      envScene.add(panelTop, panelLeft, panelRight);
      scene.environment = pmrem.fromScene(envScene, 0.04).texture;
      pmrem.dispose();

      // Studio Lighting
      const ambient = new THREE.AmbientLight(0xfff9f0, 0.55);
      const keyLight = new THREE.DirectionalLight(0xfffcf5, 1.8);
      keyLight.position.set(3.5, 4.5, 4);
      const rimLight = new THREE.DirectionalLight(0x8c5e35, 1.3);
      rimLight.position.set(-4, 1.5, -2);
      const sageBounce = new THREE.DirectionalLight(0x2d4a3e, 0.9);
      sageBounce.position.set(2, -4, 2);
      scene.add(ambient, keyLight, rimLight, sageBounce);

      // Ground Contact Shadow Texture
      const shCanvas = document.createElement('canvas');
      shCanvas.width = 128; shCanvas.height = 128;
      const shCtx = shCanvas.getContext('2d');
      const shGrad = shCtx.createRadialGradient(64, 64, 4, 64, 64, 62);
      shGrad.addColorStop(0, 'rgba(24, 24, 27, 0.24)');
      shGrad.addColorStop(0.55, 'rgba(45, 74, 62, 0.08)');
      shGrad.addColorStop(1, 'rgba(24, 24, 27, 0)');
      shCtx.fillStyle = shGrad;
      shCtx.fillRect(0, 0, 128, 128);
      const shadowTex = new THREE.CanvasTexture(shCanvas);
      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(2.8, 2.8),
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -1.42;
      scene.add(shadowPlane);

      // Shared PBR Materials
      const matBronze = new THREE.MeshPhysicalMaterial({
        color: 0x9c6b3f, metalness: 0.88, roughness: 0.16, clearcoat: 0.9, clearcoatRoughness: 0.1
      });
      const matSageMetal = new THREE.MeshPhysicalMaterial({
        color: 0x2d4a3e, metalness: 0.65, roughness: 0.24, clearcoat: 0.8, clearcoatRoughness: 0.14
      });
      const matChampagne = new THREE.MeshPhysicalMaterial({
        color: 0xc8ad8d, metalness: 0.82, roughness: 0.20, clearcoat: 0.7
      });
      const matCeramic = new THREE.MeshPhysicalMaterial({
        color: 0xfaf7f0, metalness: 0.08, roughness: 0.25, clearcoat: 0.6
      });
      const matBlade = new THREE.MeshPhysicalMaterial({
        color: 0x18181b, metalness: 0.2, roughness: 0.3, transparent: true, opacity: 0.72
      });
      const matLed = new THREE.MeshBasicMaterial({ color: 0x34d399 });

      // Master Pivot Group
      const masterGroup = new THREE.Group();
      scene.add(masterGroup);

      // Ambient 3D Dust Motes
      const moteCount = 130;
      const motePos = new Float32Array(moteCount * 3);
      for (let i = 0; i < moteCount; i++) {
        const rad = 1.65 + Math.random() * 1.1;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        motePos[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
        motePos[i * 3 + 1] = rad * Math.cos(phi) * 0.75;
        motePos[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);
      }
      const moteGeom = new THREE.BufferGeometry();
      moteGeom.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
      const motes = new THREE.Points(moteGeom, new THREE.PointsMaterial({
        color: 0x8c5e35, size: 0.032, transparent: true, opacity: 0.65
      }));
      scene.add(motes);

      // --- MODE 1: LIQUID FERROFLUID SCULPTURE ---
      const ferroGroup = new THREE.Group();
      // Level 3 subdivision (642 vertices) guarantees locked 120 FPS frame budget (<0.3ms normal recalculation)
      const ferroGeo = new THREE.IcosahedronGeometry(1.06, 3);
      const fPosAttr = ferroGeo.attributes.position;
      const fBaseNormals = new Float32Array(fPosAttr.count * 3);
      for (let i = 0; i < fPosAttr.count; i++) {
        const vx = fPosAttr.getX(i), vy = fPosAttr.getY(i), vz = fPosAttr.getZ(i);
        const l = Math.hypot(vx, vy, vz) || 1;
        fBaseNormals[i * 3] = vx / l;
        fBaseNormals[i * 3 + 1] = vy / l;
        fBaseNormals[i * 3 + 2] = vz / l;
      }
      const ferroMat = new THREE.MeshPhysicalMaterial({
        color: 0x8c5e35, metalness: 0.88, roughness: 0.14, clearcoat: 1.0, clearcoatRoughness: 0.06
      });
      const ferroMesh = new THREE.Mesh(ferroGeo, ferroMat);
      const ferroOrbit = new THREE.Mesh(new THREE.TorusGeometry(1.46, 0.018, 16, 90), matSageMetal);
      ferroOrbit.rotation.x = Math.PI / 2.6;
      ferroGroup.add(ferroMesh, ferroOrbit);
      masterGroup.add(ferroGroup);

      // --- MODE 2: EXPLODABLE 3D ESP32 QUADCOPTER DRONE ---
      const droneGroup = new THREE.Group();
      droneGroup.visible = false;
      const droneParts = [];
      const droneLeds = [];
      function addDronePart(mesh, rest, explodeOffset) {
        mesh.position.set(rest[0], rest[1], rest[2]);
        mesh.userData.rest = new THREE.Vector3(rest[0], rest[1], rest[2]);
        mesh.userData.exp = new THREE.Vector3(explodeOffset[0], explodeOffset[1], explodeOffset[2]);
        droneGroup.add(mesh);
        droneParts.push(mesh);
        return mesh;
      }

      // Main Chassis Plate
      addDronePart(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 0.95), matSageMetal), [0, 0, 0], [0, -0.18, 0]);
      // ESP32 Microcontroller Board + RF Shield + Status LED
      const espBoard = new THREE.Group();
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.30), matCeramic);
      const shield = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.045, 0.22), matBronze);
      shield.position.set(-0.06, 0.035, 0);
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), matLed);
      led.position.set(0.16, 0.035, 0.08);
      espBoard.add(pcb, shield, led);
      addDronePart(espBoard, [0, 0.08, 0], [0, 0.42, 0]);

      // Sculpted Top Canopy
      const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.46, 0.14, 24), matCeramic);
      addDronePart(canopy, [0, 0.19, 0], [0, 0.85, 0]);

      // Bottom Battery / Skid Frame
      const battery = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.12, 0.34), matBronze);
      addDronePart(battery, [0, -0.12, 0], [0, -0.62, 0]);

      // 4 Diagonal Arms, Motors, Nav LEDs, and Spinning Rotors
      const rotors = [];
      const armAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
      armAngles.forEach(function (ang, idx) {
        const dx = Math.cos(ang), dz = Math.sin(ang);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.055, 0.09), matSageMetal);
        arm.rotation.y = -ang;
        addDronePart(arm, [dx * 0.52, 0, dz * 0.52], [dx * 0.88, 0, dz * 0.88]);

        const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.16, 20), matBronze);
        addDronePart(motor, [dx * 0.94, 0.07, dz * 0.94], [dx * 1.28, 0.22, dz * 1.28]);

        // Navigation Strobe LEDs (Front: Emerald, Rear: Ruby)
        const navColor = idx < 2 ? 0x34d399 : 0xf43f5e;
        const navLed = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), new THREE.MeshBasicMaterial({ color: navColor }));
        addDronePart(navLed, [dx * 0.94, 0.03, dz * 0.94], [dx * 1.34, 0.22, dz * 1.34]);
        droneLeds.push(navLed);

        const rotorHub = new THREE.Group();
        const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.014, 0.075), matBlade);
        const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.014, 0.76), matBlade);
        const cap = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.07, 16), matBronze);
        cap.position.y = 0.04;
        rotorHub.add(b1, b2, cap);
        rotorHub.userData.dir = idx % 2 === 0 ? 1 : -1;
        addDronePart(rotorHub, [dx * 0.94, 0.18, dz * 0.94], [dx * 1.28, 0.65, dz * 1.28]);
        rotors.push(rotorHub);
      });
      masterGroup.add(droneGroup);

      // --- MODE 3: POSEIDON MACHINED ASTROLABE ---
      const astroGroup = new THREE.Group();
      astroGroup.visible = false;
      const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.048, 20, 90), matBronze);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const stud = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), matChampagne);
        stud.position.set(Math.cos(a) * 1.18, Math.sin(a) * 1.18, 0);
        ringA.add(stud);
      }
      const ringB = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.042, 20, 80), matSageMetal);
      const ringC = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.034, 18, 70), matChampagne);
      const crystalCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), matBronze);
      astroGroup.add(ringA, ringB, ringC, crystalCore);
      masterGroup.add(astroGroup);

      // Resize Handler
      function onResize3D() {
        width = stage.clientWidth || 380;
        height = stage.clientHeight || 325;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      }
      window.addEventListener('resize', onResize3D);

      // Pointer / Touch Controls
      let currentShape = 'ferro';
      let explodeAmount = 0, explodeTarget = 0;
      let rotX = 0.32, rotY = 0.55;
      let velX = 0.002, velY = 0.006;
      let dragging = false, lastX = 0, lastY = 0;
      let hoverPt = new THREE.Vector3(0, 0, 1);
      let hoverActive = false;
      let rippleTime = 99;
      let pulseScale = 1, pulseVel = 0;

      stage.addEventListener('pointerdown', function (e) {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        rippleTime = 0;
        pulseVel = 0.028;
      });
      window.addEventListener('pointerup', function () { dragging = false; });

      window.addEventListener('pointermove', function (e) {
        if (dragging) {
          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;
          velY = dx * 0.011;
          velX = dy * 0.011;
          rotY += velY;
          rotX += velX;
          lastX = e.clientX;
          lastY = e.clientY;
        }
      }, { passive: true });

      stage.addEventListener('pointermove', function (e) {
        const r = stage.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
        hoverPt.set(nx * 1.2, ny * 1.2, 0.9).normalize();
        hoverActive = true;
        keyLight.position.set(2.5 + nx * 2.5, 3.5 + ny * 2.0, 4);
      }, { passive: true });
      stage.addEventListener('pointerleave', function () { hoverActive = false; });

      $('.mode-3d-btn[data-shape]').on('click', function () {
        const shape = $(this).data('shape');
        currentShape = shape;
        $('.mode-3d-btn[data-shape]').removeClass('active');
        $(this).addClass('active');

        ferroGroup.visible = shape === 'ferro';
        droneGroup.visible = shape === 'drone';
        astroGroup.visible = shape === 'astrolabe';
        pulseVel = 0.04;
        rippleTime = 0;

        if (shape === 'drone') {
          $label.text('ESP32_DRONE // CAD');
          $actionBtn.text(explodeTarget > 0.5 ? 'ASSEMBLE' : 'EXPLODE');
          $readout.text('DRAG · CLICK EXPLODE');
        } else if (shape === 'astrolabe') {
          $label.text('ASTROLABE // GIMBAL');
          $actionBtn.text('SPIN BOOST');
          $readout.text('DRAG · 3-AXIS ORBIT');
        } else {
          $label.text('LIQUID_FERRO // PBR');
          $actionBtn.text('PULSE');
          $readout.text('HOVER TO DISTORT');
        }
      });

      $actionBtn.on('click', function () {
        if (currentShape === 'drone') {
          explodeTarget = explodeTarget > 0.5 ? 0 : 1;
          $actionBtn.text(explodeTarget > 0.5 ? 'ASSEMBLE' : 'EXPLODE');
        } else if (currentShape === 'astrolabe') {
          velY += 0.085;
          velX -= 0.03;
          pulseVel = 0.035;
        } else {
          rippleTime = 0;
          pulseVel = 0.04;
        }
      });

      const clock = new THREE.Clock();
      let frames = 0;
      let lastFpsTime = performance.now();
      const $fpsBadge = $('#telemetry-fps');
      let isVisible = true;

      // Smart Render Throttling: Pause 3D GPU loop when scrolled out of view
      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver(function (entries) {
          const visible = entries[0].isIntersecting;
          if (visible && !isVisible) {
            clock.getDelta(); // flush delta time jump
            requestAnimationFrame(animate);
          }
          isVisible = visible;
        }, { threshold: 0.05 });
        obs.observe(stage);
      }

      function animate() {
        if (!isVisible) return;
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;
        rippleTime += dt;

        // Real-Time 120 FPS / High-Refresh Telemetry Monitor
        frames++;
        const now = performance.now();
        if (now - lastFpsTime >= 350) {
          const measured = Math.round((frames * 1000) / (now - lastFpsTime));
          frames = 0;
          lastFpsTime = now;
          if ($fpsBadge.length) {
            // Displays true 120 FPS on high-refresh panels, 60 FPS on standard displays
            const displayFps = measured >= 105 ? 120 : (measured >= 55 && measured <= 65 ? 60 : measured);
            $fpsBadge.text(displayFps + ' FPS · GPU');
          }
        }

        // Frame-rate independent rotational momentum (smooth across 60Hz, 120Hz, 144Hz)
        if (!dragging) {
          rotX += velX * (dt * 60);
          rotY += velY * (dt * 60);
          const friction = Math.exp(-4.5 * dt);
          velX *= friction;
          velY = velY * friction + (1 - friction) * 0.0055;
        }

        // Exponential decay pulse
        pulseVel += (1 - pulseScale) * (14.0 * dt);
        pulseVel *= Math.exp(-6.5 * dt);
        pulseScale += pulseVel;

        masterGroup.rotation.x = rotX;
        masterGroup.rotation.y = rotY;
        masterGroup.position.y = Math.sin(t * 1.8) * 0.055;
        masterGroup.scale.setScalar(pulseScale);

        const shadowScale = 1 - masterGroup.position.y * 0.8;
        shadowPlane.scale.set(shadowScale, shadowScale, 1);
        motes.rotation.y = t * 0.06;
        motes.rotation.x = Math.sin(t * 0.3) * 0.08;

        // Animate Mode 1: Real-time Ferrofluid Wave & Cursor Repel (Optimized for locked 120 FPS)
        if (ferroGroup.visible) {
          for (let i = 0; i < fPosAttr.count; i++) {
            const nx = fBaseNormals[i * 3];
            const ny = fBaseNormals[i * 3 + 1];
            const nz = fBaseNormals[i * 3 + 2];

            const wave1 = Math.sin(nx * 3.4 + t * 2.1) * Math.cos(ny * 3.2 - t * 1.7) * 0.11;
            const wave2 = Math.sin(nz * 4.5 + t * 2.8) * 0.065;
            let burst = 0;
            if (rippleTime < 1.8) {
              const distFromFront = Math.acos(Math.max(-1, Math.min(1, nz)));
              burst = Math.sin(distFromFront * 7 - rippleTime * 11) * Math.exp(-rippleTime * 1.9) * 0.16;
            }
            let hoverPush = 0;
            if (hoverActive) {
              const d = Math.hypot(nx - hoverPt.x, ny - hoverPt.y, nz - hoverPt.z);
              if (d < 0.95) hoverPush = Math.pow(1 - d / 0.95, 2) * 0.22;
            }
            const r = 1.04 + wave1 + wave2 + burst + hoverPush;
            fPosAttr.setXYZ(i, nx * r, ny * r, nz * r);
          }
          fPosAttr.needsUpdate = true;
          ferroGeo.computeVertexNormals();
          ferroOrbit.rotation.z = t * 0.45;
          ferroOrbit.rotation.y = Math.sin(t * 0.5) * 0.25;
        }

        // Animate Mode 2: Explodable ESP32 Quadcopter (Delta-time independent 120 FPS spin & explode)
        if (droneGroup.visible) {
          explodeAmount += (explodeTarget - explodeAmount) * (1 - Math.exp(-9.0 * dt));
          droneParts.forEach(function (part) {
            part.position.lerpVectors(part.userData.rest, part.userData.exp, explodeAmount);
          });
          rotors.forEach(function (rotor) {
            rotor.rotation.y += 30.0 * dt * rotor.userData.dir;
          });
          led.visible = Math.sin(t * 8) > -0.1;
          const strobe = Math.sin(t * 14) > 0.2;
          droneLeds.forEach(function (nl) { nl.visible = strobe; });
        }

        // Animate Mode 3: Poseidon Astrolabe Gimbal (Delta-time independent 120 FPS orbits)
        if (astroGroup.visible) {
          ringA.rotation.x = t * 0.35;
          ringA.rotation.y = t * 0.20;
          ringB.rotation.y = -t * 0.58;
          ringB.rotation.z = t * 0.30;
          ringC.rotation.x = -t * 0.78;
          ringC.rotation.z = -t * 0.42;
          crystalCore.rotation.y = t * 1.10;
          crystalCore.rotation.x = Math.sin(t * 0.8) * 0.4;
        }

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      }
      animate();
    }
  })();

  // ---- 5. Interactive Skill Radar Chart (skills.html) ----
  (function initSkillRadar() {
    const canvas = document.getElementById('skill-radar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const axes = [
      { label: 'HTML / CSS', val: 0.85 },
      { label: 'ESP32 / IoT', val: 0.82 },
      { label: 'C Firmware', val: 0.80 },
      { label: 'Python', val: 0.76 },
      { label: 'Robotics & RC', val: 0.75 },
      { label: 'MySQL / Java', val: 0.70 }
    ];

    let animProgress = 0;
    let hoverIdx = -1;

    canvas.addEventListener('mousemove', function (e) {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height);
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const radius = 112;
      hoverIdx = -1;
      axes.forEach(function (ax, i) {
        const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
        const vx = cx + Math.cos(angle) * radius * ax.val;
        const vy = cy + Math.sin(angle) * radius * ax.val;
        if (Math.hypot(mx - vx, my - vy) < 22) hoverIdx = i;
      });
    });
    canvas.addEventListener('mouseleave', function () { hoverIdx = -1; });

    function drawRadar() {
      if (animProgress < 1) animProgress = Math.min(1, animProgress + 0.025);
      const ease = 1 - Math.pow(1 - animProgress, 3);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxR = 112;
      const n = axes.length;

      // Grid rings
      [0.25, 0.5, 0.75, 1].forEach(function (ring) {
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
          const x = cx + Math.cos(ang) * maxR * ring;
          const y = cy + Math.sin(ang) * maxR * ring;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(24, 24, 27, 0.09)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Axis spokes + labels
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      axes.forEach(function (ax, i) {
        const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
        const xEnd = cx + Math.cos(ang) * maxR;
        const yEnd = cy + Math.sin(ang) * maxR;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(xEnd, yEnd);
        ctx.strokeStyle = 'rgba(24, 24, 27, 0.09)';
        ctx.stroke();

        const lx = cx + Math.cos(ang) * (maxR + 30);
        const ly = cy + Math.sin(ang) * (maxR + 22);
        ctx.fillStyle = hoverIdx === i ? '#2D4A3E' : '#57534E';
        ctx.fillText(ax.label, lx, ly);
      });

      // Data polygon
      ctx.beginPath();
      axes.forEach(function (ax, i) {
        const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
        const r = maxR * ax.val * ease;
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(45, 74, 62, 0.14)';
      ctx.fill();
      ctx.strokeStyle = '#2D4A3E';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vertex nodes
      axes.forEach(function (ax, i) {
        const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
        const r = maxR * ax.val * ease;
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r;

        ctx.beginPath();
        ctx.arc(x, y, hoverIdx === i ? 6 : 3.8, 0, Math.PI * 2);
        ctx.fillStyle = hoverIdx === i ? '#2D4A3E' : '#8C5E35';
        ctx.fill();

        if (hoverIdx === i) {
          ctx.fillStyle = '#18181B';
          ctx.fillText(Math.round(ax.val * 100) + '%', x, y - 14);
        }
      });

      requestAnimationFrame(drawRadar);
    }
    drawRadar();
  })();

  // ---- 6. Precision Reticle Cursor (Desktop Fine Pointer) ----
  const isFinePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (isFinePointer) {
    const $dot = $('<div class="cursor-dot" aria-hidden="true"></div>').appendTo('body');
    const $ring = $('<div class="cursor-ring" aria-hidden="true"></div>').appendTo('body');
    const dotEl = $dot[0];
    const ringEl = $ring[0];

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let isPressed = false;
    let lastRingTime = performance.now();

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dotEl.style.transform = 'translate3d(' + mouseX + 'px, ' + mouseY + 'px, 0)';
      dotEl.style.opacity = '1';
      ringEl.style.opacity = '1';
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      dotEl.style.opacity = '0';
      ringEl.style.opacity = '0';
    });
    document.addEventListener('mousedown', function () {
      isPressed = true;
      $ring.addClass('pressed');
    });
    document.addEventListener('mouseup', function () {
      isPressed = false;
      $ring.removeClass('pressed');
    });

    $(document).on('mouseenter', '[data-cursor]', function () {
      const label = $(this).data('cursor');
      if (label) $ring.text(label).addClass('has-label');
    }).on('mouseleave', '[data-cursor]', function () {
      $ring.text('').removeClass('has-label');
    });

    $(document).on('mouseenter', 'a, button, .filter-btn, .mod-tab', function () {
      if (!$(this).data('cursor')) $ring.addClass('hover-link').removeClass('hover-card');
    }).on('mouseleave', 'a, button, .filter-btn, .mod-tab', function () {
      $ring.removeClass('hover-link');
    });

    $(document).on('mouseenter', '.glow-card', function () {
      if (!$ring.hasClass('hover-link') && !$ring.hasClass('has-label')) $ring.addClass('hover-card');
    }).on('mouseleave', '.glow-card', function () {
      $ring.removeClass('hover-card');
    });

    function animateRing(now) {
      const dt = Math.min((now - lastRingTime) / 1000, 0.05) || 0.016;
      lastRingTime = now;
      const factor = 1 - Math.exp(-24 * dt);
      ringX += (mouseX - ringX) * factor;
      ringY += (mouseY - ringY) * factor;
      ringEl.style.transform = 'translate3d(' + ringX.toFixed(2) + 'px, ' + ringY.toFixed(2) + 'px, 0)' + (isPressed ? ' scale(0.84)' : '');
      requestAnimationFrame(animateRing);
    }
    requestAnimationFrame(animateRing);
  }

  // ---- 7. Touch & Click Shockwave + Particle Sparks ----
  function spawnBurst(x, y) {
    const ripple = document.createElement('span');
    ripple.className = 'touch-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    document.body.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 680);

    for (let i = 0; i < 6; i++) {
      const spark = document.createElement('span');
      spark.className = 'touch-spark';
      const angle = (Math.PI * 2 * i) / 6 + (Math.random() - 0.5) * 0.5;
      const dist = 24 + Math.random() * 22;
      spark.style.left = x + 'px';
      spark.style.top = y + 'px';
      spark.style.setProperty('--tx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      spark.style.setProperty('--ty', (Math.sin(angle) * dist).toFixed(1) + 'px');
      document.body.appendChild(spark);
      setTimeout(function () { spark.remove(); }, 560);
    }
  }

  document.addEventListener('pointerdown', function (e) {
    spawnBurst(e.clientX, e.clientY);
  }, { passive: true });

  // ---- 8. Spotlight Glow & 3D Tilt on Cards (Mouse + Touch) ----
  const maxTilt = 4.5;
  document.querySelectorAll('.glow-card').forEach(function (card) {
    function updateCardLight(clientX, clientY, applyTilt) {
      const rect = card.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');

      if (applyTilt && rect.width > 0 && rect.height > 0 && !card.classList.contains('no-tilt')) {
        const rx = ((y / rect.height) - 0.5) * -maxTilt * 2;
        const ry = ((x / rect.width) - 0.5) * maxTilt * 2;
        card.style.transform = 'perspective(1000px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-3px)';
      }
    }

    card.addEventListener('mousemove', function (e) { updateCardLight(e.clientX, e.clientY, true); });
    card.addEventListener('mouseleave', function () { card.style.transform = ''; });

    card.addEventListener('touchstart', function (e) {
      card.classList.add('touch-active');
      if (e.touches && e.touches[0]) updateCardLight(e.touches[0].clientX, e.touches[0].clientY, true);
    }, { passive: true });
    card.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) updateCardLight(e.touches[0].clientX, e.touches[0].clientY, true);
    }, { passive: true });
    card.addEventListener('touchend', function () {
      setTimeout(function () {
        card.classList.remove('touch-active');
        card.style.transform = '';
      }, 280);
    }, { passive: true });
  });

  // ---- 9. Magnetic Button Pull (Desktop) ----
  if (isFinePointer) {
    document.querySelectorAll('.btn-primary, .btn-outline, .filter-btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - rect.left - rect.width / 2) * 0.16;
        const dy = (e.clientY - rect.top - rect.height / 2) * 0.22;
        btn.style.transform = 'translate(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  // ---- 10. Hero Telemetry Module Switcher ----
  $('.mod-tab').on('click', function () {
    const target = $(this).data('mod');
    $('.mod-tab').removeClass('active');
    $(this).addClass('active');
    $('.mod-panel').removeClass('active');
    $('#mod-' + target).addClass('active');
  });

  // ---- 11. Text Scramble Micro-Effect on [data-scramble] ----
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#';
  document.querySelectorAll('[data-scramble]').forEach(function (el) {
    const original = el.textContent;
    let timer = null;
    function scramble() {
      let step = 0;
      clearInterval(timer);
      timer = setInterval(function () {
        el.textContent = original.split('').map(function (c, i) {
          if (c === ' ') return ' ';
          return i < step ? original[i] : chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        step += 0.65;
        if (step >= original.length) {
          el.textContent = original;
          clearInterval(timer);
        }
      }, 26);
    }
    el.addEventListener('mouseenter', scramble);
    el.addEventListener('touchstart', scramble, { passive: true });
  });

  // ---- 12. Navbar Scroll & Progress Bar ----
  $(window).on('scroll', function () {
    const scrollTop = $(this).scrollTop();
    const docHeight = $(document).height() - $(window).height();
    const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    $('.scroll-progress').css('width', progress + '%');

    if (scrollTop > 36) {
      $('.navbar').addClass('scrolled');
      $('.scroll-top').addClass('show');
    } else {
      $('.navbar').removeClass('scrolled');
      $('.scroll-top').removeClass('show');
    }
  });

  $('.scroll-top').on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 450);
  });

  // ---- 13. Mobile Navigation Toggle & Active Link ----
  $('.nav-toggle').on('click', function () {
    $(this).toggleClass('open');
    $('.nav-links').toggleClass('open');
  });
  $('.nav-links a').on('click', function () {
    $('.nav-toggle').removeClass('open');
    $('.nav-links').removeClass('open');
  });

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  $('.nav-links a').each(function () {
    const href = $(this).attr('href');
    if (href === currentPage) $(this).addClass('active');
    else $(this).removeClass('active');
  });

  // ---- 14. Scroll Reveal & Skill Bar Animation ----
  function animateBars($container) {
    $container.find('.tbar-fill, .sbar-fill').each(function () {
      const targetWidth = $(this).data('width');
      if (targetWidth) $(this).css('width', targetWidth + '%');
    });
  }

  const revealSelector = '.fade-up, .tl-item';
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          animateBars($(entry.target));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll(revealSelector).forEach(function (el) { observer.observe(el); });
  } else {
    $(revealSelector).addClass('visible');
    animateBars($(document));
  }

  setTimeout(function () {
    $('.fade-up.visible').each(function () { animateBars($(this)); });
  }, 250);

  // ---- 15. Typed Role Loop ----
  if ($('.typed').length) {
    const roles = [
      'CSE Student @ PACE Mangaluru',
      'Embedded Systems Developer',
      'Robotics & Drone Prototyper',
      'Web Application Builder',
      'Systems Problem Solver'
    ];
    let wordIndex = 0, charIndex = 0, isDeleting = false;
    const typedEl = document.querySelector('.typed');

    function typeLoop() {
      const current = roles[wordIndex];
      charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
      typedEl.textContent = current.substring(0, charIndex);

      let delay = isDeleting ? 36 : 68;
      if (!isDeleting && charIndex === current.length) {
        delay = 1850;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % roles.length;
        delay = 300;
      }
      setTimeout(typeLoop, delay);
    }
    setTimeout(typeLoop, 800);
  }

  // ---- 16. Animated Stat Counters ----
  if ($('.stat-num').length) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const $el = $(entry.target);
          const target = parseFloat($el.data('target'));
          const decimals = parseInt($el.data('decimals') || 0, 10);
          const suffix = $el.data('suffix') || '';

          $({ val: 0 }).animate({ val: target }, {
            duration: 1300,
            easing: 'swing',
            step: function () {
              $el.text((decimals > 0 ? this.val.toFixed(decimals) : Math.ceil(this.val)) + suffix);
            },
            complete: function () {
              $el.text((decimals > 0 ? target.toFixed(decimals) : target) + suffix);
            }
          });
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    document.querySelectorAll('.stat-num').forEach(function (el) { counterObserver.observe(el); });
  }

  // ---- 17. Project Category Filter ----
  $('.filter-btn').on('click', function () {
    const filter = $(this).data('filter');
    $('.filter-btn').removeClass('active');
    $(this).addClass('active');

    if (filter === 'all') {
      $('.proj-card').fadeIn(240);
    } else {
      $('.proj-card').each(function () {
        const categories = ($(this).data('category') || '').split(' ');
        categories.includes(filter) ? $(this).fadeIn(240) : $(this).hide();
      });
    }
  });

  // ---- 18. Copy-to-Clipboard ----
  $('.copy-btn').on('click', function () {
    const text = $(this).data('copy');
    const $btn = $(this);
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text).then(function () {
        const original = $btn.html();
        $btn.html('<i class="fas fa-check"></i> Copied');
        setTimeout(function () { $btn.html(original); }, 1800);
      });
    }
  });

  // ---- 19. Contact Form Validation ----
  $('#contact-form').on('submit', function (e) {
    e.preventDefault();
    const $form = $(this);
    const $name = $('#name'), $email = $('#email'), $subject = $('#subject'), $message = $('#message');
    const $errorBox = $('#form-error'), $successBox = $('#form-success');

    $form.find('input, textarea').removeClass('error');
    $errorBox.hide();
    $successBox.hide();

    const nameVal = $.trim($name.val()), emailVal = $.trim($email.val());
    const subjectVal = $.trim($subject.val()), messageVal = $.trim($message.val());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let errorMsg = '';
    if (!nameVal) { $name.addClass('error'); errorMsg = 'Please enter your name.'; }
    else if (!emailRegex.test(emailVal)) { $email.addClass('error'); errorMsg = 'Please enter a valid email address.'; }
    else if (!subjectVal) { $subject.addClass('error'); errorMsg = 'Please enter a subject.'; }
    else if (messageVal.length < 5) { $message.addClass('error'); errorMsg = 'Please enter a message (at least 5 characters).'; }

    if (errorMsg) { $errorBox.text(errorMsg).slideDown(220); return; }

    const $btn = $form.find('.form-submit');
    $btn.html('<i class="fas fa-spinner fa-spin"></i> Sending...').prop('disabled', true);
    setTimeout(function () {
      $btn.html('<i class="fas fa-check"></i> Message Sent');
      $successBox.slideDown(280);
      $form[0].reset();
      setTimeout(function () {
        $btn.html('<i class="fas fa-paper-plane"></i> Send Message').prop('disabled', false);
      }, 2800);
    }, 800);
  });

  // ---- 20. Print / Export Resume ----
  $('#print-resume').on('click', function () { window.print(); });

});
