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
    const nodeCount = isSmall ? 18 : 36;
    const maxDist = isSmall ? 90 : 125;
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

  // ---- 4. Master 60 FPS Kinetic Sculpture Engine (Three.js r134) ----
  (function initWebGLStudio() {
    const canvas = document.getElementById('scene-3d');
    if (!canvas) return;
    const stage = canvas.parentElement;
    const $readout = $('#rot-readout');
    const $label = $('#shape-label');
    const $actionBtn = $('#trigger-3d-fx');
    const $fpsBadge = $('#telemetry-fps');

    if (typeof THREE !== 'undefined') {
      let width = stage.clientWidth || 380;
      let height = stage.clientHeight || 325;

      const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      // Clamping DPR to 1.5 cuts GPU fill-rate overhead by 44% on mobile/Retina while keeping visuals razor-sharp
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.outputEncoding = THREE.sRGBEncoding;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
      camera.position.set(0, 0.28, 4.2);
      camera.lookAt(0, 0, 0);

      // Featherweight Studio Lighting (Universal, zero GPU compute passes, instant compilation)
      const hemiLight = new THREE.HemisphereLight(0xfffbf2, 0xd8d1c4, 0.85);
      const keyLight = new THREE.DirectionalLight(0xfffdf5, 1.5);
      keyLight.position.set(3.5, 4.5, 4);
      const rimLight = new THREE.DirectionalLight(0x8c5e35, 1.2);
      rimLight.position.set(-4, 1.5, -2);
      const sageBounce = new THREE.DirectionalLight(0x2d4a3e, 0.9);
      sageBounce.position.set(2, -4, 2);
      scene.add(hemiLight, keyLight, rimLight, sageBounce);

      // Contact Floor Shadow
      const shCanvas = document.createElement('canvas');
      shCanvas.width = 128; shCanvas.height = 128;
      const shCtx = shCanvas.getContext('2d');
      const shGrad = shCtx.createRadialGradient(64, 64, 4, 64, 64, 62);
      shGrad.addColorStop(0, 'rgba(24, 24, 27, 0.22)');
      shGrad.addColorStop(0.5, 'rgba(45, 74, 62, 0.07)');
      shGrad.addColorStop(1, 'rgba(24, 24, 27, 0)');
      shCtx.fillStyle = shGrad;
      shCtx.fillRect(0, 0, 128, 128);
      const shadowTex = new THREE.CanvasTexture(shCanvas);
      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(3.0, 3.0),
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -1.45;
      scene.add(shadowPlane);

      // Master PBR Materials (Lightweight Standard PBR, supported on 100% of devices & mobile GPUs)
      const matBronze = new THREE.MeshStandardMaterial({
        color: 0x9c6b3f, metalness: 0.88, roughness: 0.22
      });
      const matSageMetal = new THREE.MeshStandardMaterial({
        color: 0x2d4a3e, metalness: 0.70, roughness: 0.25
      });
      const matChampagne = new THREE.MeshStandardMaterial({
        color: 0xd4b896, metalness: 0.85, roughness: 0.18
      });
      const matCeramic = new THREE.MeshStandardMaterial({
        color: 0xfaf7f0, metalness: 0.05, roughness: 0.22
      });
      const matPrism = new THREE.MeshStandardMaterial({
        color: 0x3f6b59, metalness: 0.35, roughness: 0.12, transparent: true, opacity: 0.88
      });
      const matGlowingCore = new THREE.MeshStandardMaterial({
        color: 0x8c5e35, emissive: 0x8c5e35, emissiveIntensity: 0.55, roughness: 0.2
      });

      // Master Pivot Group
      const masterGroup = new THREE.Group();
      scene.add(masterGroup);

      // Floating Ambient Stardust Motes
      const moteCount = 90;
      const motePos = new Float32Array(moteCount * 3);
      for (let i = 0; i < moteCount; i++) {
        const rad = 1.6 + Math.random() * 1.2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        motePos[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
        motePos[i * 3 + 1] = rad * Math.cos(phi) * 0.7;
        motePos[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);
      }
      const moteGeom = new THREE.BufferGeometry();
      moteGeom.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
      const motes = new THREE.Points(moteGeom, new THREE.PointsMaterial({
        color: 0x8c5e35, size: 0.034, transparent: true, opacity: 0.6
      }));
      scene.add(motes);

      // =================================================================
      // MODE 1: KINETIC ORRERY (Celestial Chronograph with Satellite Orbits)
      // =================================================================
      const orreryGroup = new THREE.Group();

      // Outer Machined Bronze Dial Ring with 12 Hour Studs
      const ringOuter = new THREE.Mesh(new THREE.TorusGeometry(1.38, 0.034, 18, 90), matBronze);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.04, 12), matChampagne);
        stud.position.set(Math.cos(a) * 1.38, Math.sin(a) * 1.38, 0);
        stud.rotation.z = a;
        ringOuter.add(stud);
      }

      // Middle Faceted Sage Gimbal Ring
      const ringMid = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.030, 16, 80), matSageMetal);

      // Inner Champagne Gimbal Ring
      const ringInner = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.022, 16, 70), matChampagne);

      // 4 Orbital Satellite Arms & Spheres
      const satellites = [];
      const satConfigs = [
        { r: 1.24, speed: 0.9, tilt: 0.45, size: 0.075, mat: matChampagne },
        { r: 0.95, speed: -1.3, tilt: -0.65, size: 0.062, mat: matSageMetal },
        { r: 0.62, speed: 1.8, tilt: 0.85, size: 0.052, mat: matBronze },
        { r: 0.42, speed: -2.4, tilt: -0.2, size: 0.042, mat: matCeramic }
      ];
      satConfigs.forEach(function (cfg) {
        const satPivot = new THREE.Group();
        satPivot.rotation.x = cfg.tilt;
        const satMesh = new THREE.Mesh(new THREE.SphereGeometry(cfg.size, 16, 16), cfg.mat);
        satMesh.position.x = cfg.r;
        satPivot.add(satMesh);
        orreryGroup.add(satPivot);
        satellites.push({ pivot: satPivot, speed: cfg.speed });
      });

      // Faceted Icosa-Crystal Neural Core + Inner Heart
      const coreGroup = new THREE.Group();
      const crystalMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.38, 0), matPrism);
      const innerHeart = new THREE.Mesh(new THREE.DodecahedronGeometry(0.20, 0), matGlowingCore);
      coreGroup.add(crystalMesh, innerHeart);

      orreryGroup.add(ringOuter, ringMid, ringInner, coreGroup);
      masterGroup.add(orreryGroup);

      // =================================================================
      // MODE 2: KINETIC IRIS (Mechanical Aperture Bloom)
      // =================================================================
      const irisGroup = new THREE.Group();
      irisGroup.visible = false;
      const bladeCount = 10;
      const irisBlades = [];

      // Outer aperture collar
      const irisCollar = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.045, 18, 80), matBronze);
      irisGroup.add(irisCollar);

      // 10 Interlocking Curved Aperture Blades
      for (let i = 0; i < bladeCount; i++) {
        const bladePivot = new THREE.Group();
        const baseAngle = (i / bladeCount) * Math.PI * 2;
        bladePivot.rotation.z = baseAngle;

        const bladeGeo = new THREE.BoxGeometry(0.68, 0.016, 0.32);
        const bladeMesh = new THREE.Mesh(bladeGeo, i % 2 === 0 ? matSageMetal : matChampagne);
        bladeMesh.position.set(0.48, 0.14, (i - bladeCount / 2) * 0.012);
        bladeMesh.rotation.z = 0.32;
        bladePivot.add(bladeMesh);

        irisGroup.add(bladePivot);
        irisBlades.push({ pivot: bladePivot, baseAngle: baseAngle });
      }

      // Inner Glowing Diode Matrix inside the Aperture
      const irisMatrix = new THREE.Group();
      for (let row = -2; row <= 2; row++) {
        for (let col = -2; col <= 2; col++) {
          if (Math.hypot(row, col) <= 2.2) {
            const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 6), matCeramic);
            hex.position.set(col * 0.13, row * 0.13, 0);
            hex.rotation.x = Math.PI / 2;
            irisMatrix.add(hex);
          }
        }
      }
      const irisCenterLight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), matGlowingCore);
      irisMatrix.add(irisCenterLight);
      irisGroup.add(irisMatrix);
      masterGroup.add(irisGroup);

      // =================================================================
      // MODE 3: NEURAL PRISM (Quantum Hyper-Lattice)
      // =================================================================
      const prismGroup = new THREE.Group();
      prismGroup.visible = false;

      // Outer Bronze Wireframe Dodecahedron
      const dodecaGeo = new THREE.DodecahedronGeometry(1.15, 0);
      const dodecaWire = new THREE.LineSegments(
        new THREE.WireframeGeometry(dodecaGeo),
        new THREE.LineBasicMaterial({ color: 0x8c5e35, linewidth: 2 })
      );
      prismGroup.add(dodecaWire);

      // Intersecting Star Tetrahedron (Stella Octangula)
      const tet1 = new THREE.Mesh(new THREE.TetrahedronGeometry(0.85, 0), matSageMetal);
      const tet2 = new THREE.Mesh(new THREE.TetrahedronGeometry(0.85, 0), matChampagne);
      tet2.rotation.x = Math.PI;
      tet2.rotation.y = Math.PI / 3;
      const starTet = new THREE.Group();
      starTet.add(tet1, tet2);
      prismGroup.add(starTet);

      // Vertex Quantum Nodes & Floating Beacons
      const nodeCount = 14;
      const prismNodes = [];
      for (let i = 0; i < nodeCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / nodeCount);
        const theta = Math.sqrt(nodeCount * Math.PI) * phi;
        const r = 1.15;
        const node = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 14), matBronze);
        node.userData.rest = new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        );
        node.position.copy(node.userData.rest);
        prismGroup.add(node);
        prismNodes.push(node);
      }

      // Central Optical Crystal Core
      const centerDiamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), matPrism);
      prismGroup.add(centerDiamond);
      masterGroup.add(prismGroup);

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
      let currentShape = 'orrery';
      let kineticState = false;
      let kineticProgress = 0;
      let rotX = 0.35, rotY = -0.45;
      let velX = 0.001, velY = 0.005;
      let dragging = false, lastX = 0, lastY = 0;
      let pulseScale = 1, pulseVel = 0;

      stage.addEventListener('pointerdown', function (e) {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        pulseVel = 0.032;
      });
      window.addEventListener('pointerup', function () { dragging = false; });

      window.addEventListener('pointermove', function (e) {
        if (dragging) {
          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;
          velY = dx * 0.009;
          velX = dy * 0.009;
          rotY += velY;
          rotX = Math.max(-1.3, Math.min(1.3, rotX + velX));
          lastX = e.clientX;
          lastY = e.clientY;
        }
      }, { passive: true });

      stage.addEventListener('pointermove', function (e) {
        const r = stage.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
        keyLight.position.set(3.0 + nx * 2.2, 4.0 + ny * 1.8, 4);
      }, { passive: true });

      function setKineticShape(shape) {
        currentShape = shape;
        $('.mode-3d-btn[data-shape]').removeClass('active');
        $('.mode-3d-btn[data-shape="' + shape + '"]').addClass('active');

        orreryGroup.visible = shape === 'orrery';
        irisGroup.visible = shape === 'iris';
        prismGroup.visible = shape === 'prism';

        kineticState = false;
        kineticProgress = 0;
        pulseVel = 0.035;

        if (shape === 'orrery') {
          $label.text('ORRERY // KINETIC CORE');
          $actionBtn.text('ALIGN');
          $readout.text('DRAG TO ORBIT · TAP ALIGN');
        } else if (shape === 'iris') {
          $label.text('KINETIC_IRIS // BLOOM');
          $actionBtn.text('BLOOM');
          $readout.text('DRAG TO ORBIT · TAP BLOOM');
        } else {
          $label.text('NEURAL_PRISM // QUANTUM');
          $actionBtn.text('PULSE');
          $readout.text('DRAG TO ORBIT · TAP PULSE');
        }
      }

      $('.mode-3d-btn[data-shape]').on('click', function () {
        setKineticShape($(this).data('shape'));
      });

      function triggerAction() {
        kineticState = !kineticState;
        pulseVel = 0.045;
        if (currentShape === 'orrery') {
          $actionBtn.text(kineticState ? 'EXPAND' : 'ALIGN');
        } else if (currentShape === 'iris') {
          $actionBtn.text(kineticState ? 'CONTRACT' : 'BLOOM');
        } else {
          pulseVel = 0.08;
        }
      }

      $actionBtn.on('click', triggerAction);

      // =================================================================
      // UNIVERSAL 60 FPS RENDER LOOP (Consistent across all devices)
      // =================================================================
      const targetFps = 60;
      const frameInterval = 1000 / targetFps; // 16.666 ms
      let lastDrawTime = performance.now();
      let frames = 0;
      let lastFpsMeasure = performance.now();
      let isVisible = true;

      // Smart Render Pausing: yield GPU resources when scrolled out of view
      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver(function (entries) {
          const vis = entries[0].isIntersecting;
          if (vis && !isVisible) {
            lastDrawTime = performance.now();
            requestAnimationFrame(animate);
          }
          isVisible = vis;
        }, { threshold: 0.05 });
        obs.observe(stage);
      }

      function animate(now) {
        if (!isVisible) return;
        requestAnimationFrame(animate);

        // Frame rate limiter: locks cleanly to 60 FPS on 60Hz, 120Hz, 144Hz displays
        const elapsed = now - lastDrawTime;
        if (elapsed < frameInterval - 1.2) {
          return;
        }
        lastDrawTime = now - (elapsed % frameInterval);

        const dt = Math.min(elapsed / 1000, 0.04);
        const t = now * 0.001;

        // Telemetry monitor: Solid 60 FPS
        frames++;
        if (now - lastFpsMeasure >= 400) {
          const fps = Math.min(60, Math.round((frames * 1000) / (now - lastFpsMeasure)));
          frames = 0;
          lastFpsMeasure = now;
          if ($fpsBadge.length) {
            $fpsBadge.text(fps + ' FPS · GPU');
          }
        }

        // Inertia damping (smooth exponential physics)
        if (!dragging) {
          rotX += velX;
          rotY += velY;
          velX *= 0.95;
          velY = velY * 0.95 + 0.00028;
          if (Math.abs(velY) < 0.005) velY = 0.0055;
        }

        // Pulse spring physics
        pulseVel += (1 - pulseScale) * 0.18;
        pulseVel *= 0.82;
        pulseScale += pulseVel;

        masterGroup.rotation.x = rotX;
        masterGroup.rotation.y = rotY;
        masterGroup.position.y = Math.sin(t * 1.6) * 0.045;
        masterGroup.scale.setScalar(pulseScale);

        const shadowScale = 1 - masterGroup.position.y * 0.75;
        shadowPlane.scale.set(shadowScale, shadowScale, 1);
        motes.rotation.y = t * 0.04;

        // Smooth kinetic transition target (0 to 1)
        kineticProgress += ((kineticState ? 1 : 0) - kineticProgress) * 0.08;

        // --- ANIMATE MODE 1: ORRERY ---
        if (orreryGroup.visible) {
          const align = kineticProgress;
          ringOuter.rotation.z = t * 0.25;
          ringOuter.rotation.x = THREE.MathUtils.lerp(0.35, 0, align);

          ringMid.rotation.x = THREE.MathUtils.lerp(t * 0.45, 0, align);
          ringMid.rotation.y = THREE.MathUtils.lerp(-t * 0.32, 0, align);

          ringInner.rotation.y = THREE.MathUtils.lerp(t * 0.75, 0, align);
          ringInner.rotation.z = THREE.MathUtils.lerp(-t * 0.5, 0, align);

          satellites.forEach(function (sat, idx) {
            sat.pivot.rotation.z += sat.speed * dt;
            sat.pivot.rotation.x = THREE.MathUtils.lerp(satConfigs[idx].tilt, 0, align);
          });

          crystalMesh.rotation.y = t * 0.85;
          crystalMesh.rotation.x = Math.sin(t * 0.7) * 0.35;
          innerHeart.rotation.y = -t * 1.2;
        }

        // --- ANIMATE MODE 2: KINETIC IRIS ---
        if (irisGroup.visible) {
          irisCollar.rotation.z = t * 0.15;
          const bloom = kineticProgress;
          irisBlades.forEach(function (blade) {
            const bladeAngle = blade.baseAngle + (bloom * 0.55);
            blade.pivot.rotation.z = bladeAngle;
            blade.pivot.children[0].rotation.z = 0.32 - bloom * 0.28;
            blade.pivot.children[0].position.x = 0.48 + bloom * 0.24;
          });
          irisMatrix.rotation.z = -t * 0.35;
          irisCenterLight.scale.setScalar(1 + bloom * 0.4 + Math.sin(t * 4) * 0.08);
        }

        // --- ANIMATE MODE 3: NEURAL PRISM ---
        if (prismGroup.visible) {
          dodecaWire.rotation.y = t * 0.32;
          dodecaWire.rotation.x = Math.sin(t * 0.4) * 0.2;

          starTet.rotation.y = -t * 0.65;
          starTet.rotation.z = t * 0.35;

          centerDiamond.rotation.y = t * 1.1;
          centerDiamond.rotation.x = t * 0.7;

          prismNodes.forEach(function (node, idx) {
            const wave = Math.sin(t * 2.5 + idx) * 0.06;
            const radialPush = 1 + wave + kineticProgress * 0.35;
            node.position.copy(node.userData.rest).multiplyScalar(radialPush);
          });
        }

        renderer.render(scene, camera);
      }
      requestAnimationFrame(animate);
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

    if (isFinePointer) {
      card.addEventListener('mousemove', function (e) { updateCardLight(e.clientX, e.clientY, true); }, { passive: true });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    } else {
      card.addEventListener('touchstart', function () {
        card.classList.add('touch-active');
      }, { passive: true });
      card.addEventListener('touchend', function () {
        setTimeout(function () {
          card.classList.remove('touch-active');
        }, 220);
      }, { passive: true });
    }
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
