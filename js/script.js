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

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        if (pointer.active) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 175 && dist > 1) {
            n.x += (dx / dist) * 0.38;
            n.y += (dy / dist) * 0.38;
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
    draw();
  })();

  // ---- 4. Real-Time 3D Interactive Gyroscope / Drone IMU Canvas (index.html) ----
  (function initGyroCanvas() {
    const canvas = document.getElementById('gyro-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const stage = canvas.parentElement;

    function resizeGyro() {
      canvas.width = stage.clientWidth || 360;
      canvas.height = stage.clientHeight || 210;
    }
    resizeGyro();
    window.addEventListener('resize', resizeGyro);

    // 3D Octahedron + Quad-Arm Frame vertices (drone / IMU geometry)
    const vertices = [
      [0, -1.15, 0],   // Top apex
      [0,  1.15, 0],   // Bottom apex
      [1.25, 0, 0],    // +X arm
      [-1.25, 0, 0],   // -X arm
      [0, 0, 1.25],    // +Z arm
      [0, 0, -1.25],   // -Z arm
      [0.85, 0, 0.85], // Diagonal ring points
      [-0.85, 0, 0.85],
      [-0.85, 0, -0.85],
      [0.85, 0, -0.85]
    ];
    const edges = [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 6], [6, 4], [4, 7], [7, 3],
      [3, 8], [8, 5], [5, 9], [9, 2],
      [2, 3], [4, 5]
    ];

    let rotX = 0.35;
    let rotY = 0.6;
    let velX = 0.005;
    let velY = 0.011;
    let dragging = false;
    let lastX = 0, lastY = 0;

    stage.addEventListener('pointerdown', function (e) {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    window.addEventListener('pointerup', function () { dragging = false; });
    window.addEventListener('pointermove', function (e) {
      if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        velY = dx * 0.009;
        velX = dy * 0.009;
        rotY += velY;
        rotX += velX;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    }, { passive: true });

    stage.addEventListener('mousemove', function (e) {
      if (!dragging) {
        const r = stage.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width - 0.5) * 0.03;
        const ny = ((e.clientY - r.top) / r.height - 0.5) * 0.03;
        velY = 0.008 + nx;
        velX = 0.003 + ny;
      }
    });

    const $angles = $('#gyro-angles');

    function project(v) {
      // Rotate X
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const y1 = v[1] * cosX - v[2] * sinX;
      const z1 = v[1] * sinX + v[2] * cosX;
      // Rotate Y
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const x2 = v[0] * cosY + z1 * sinY;
      const z2 = -v[0] * sinY + z1 * cosY;

      const scale = Math.min(canvas.width, canvas.height) * 0.36;
      const fov = 4 / (4 + z2);
      return {
        x: canvas.width / 2 + x2 * scale * fov,
        y: canvas.height / 2 + y1 * scale * fov,
        z: z2
      };
    }

    function renderGyro() {
      if (!dragging) {
        rotX += velX;
        rotY += velY;
        velX *= 0.992;
        velY = velY * 0.992 + 0.0001;
        if (Math.abs(velY) < 0.007) velY = 0.008;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle crosshair circle
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const rad = Math.min(canvas.width, canvas.height) * 0.38;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(24, 24, 27, 0.09)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      const pts = vertices.map(project);

      edges.forEach(function (edge, idx) {
        const a = pts[edge[0]];
        const b = pts[edge[1]];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = idx < 8 ? 'rgba(45, 74, 62, 0.78)' : 'rgba(140, 94, 53, 0.48)';
        ctx.lineWidth = idx < 8 ? 1.5 : 1.05;
        ctx.stroke();
      });

      pts.forEach(function (p, i) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, i < 6 ? 3.2 : 2, 0, Math.PI * 2);
        ctx.fillStyle = i < 2 ? '#2D4A3E' : '#8C5E35';
        ctx.fill();
      });

      if ($angles.length) {
        const pDeg = Math.round(((rotX * 180 / Math.PI) % 360 + 360) % 360);
        const yDeg = Math.round(((rotY * 180 / Math.PI) % 360 + 360) % 360);
        $angles.text('PITCH ' + pDeg + '° · YAW ' + yDeg + '°');
      }

      requestAnimationFrame(renderGyro);
    }
    renderGyro();
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

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    $(document).on('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      $dot.css({ left: mouseX + 'px', top: mouseY + 'px', opacity: 1 });
      $ring.css('opacity', 1);
    });
    $(document).on('mouseleave', function () {
      $dot.css('opacity', 0);
      $ring.css('opacity', 0);
    });
    $(document).on('mousedown', function () { $ring.addClass('pressed'); });
    $(document).on('mouseup', function () { $ring.removeClass('pressed'); });

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

    (function animateRing() {
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;
      $ring.css({ left: ringX + 'px', top: ringY + 'px' });
      requestAnimationFrame(animateRing);
    })();
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
