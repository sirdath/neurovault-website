/* ============================================================
   NV GROW — a knowledge graph that BUILDS itself.
   Starts as a single seed node in the centre. Every beat, a new
   node sprouts from an existing one and wires back to it with a
   line that draws outward — branching from the middle to the
   edges, the way a brain forms. When the web is grown it stays
   alive: hub nodes breathe, signals fire along the edges, and the
   whole graph leans gently toward the cursor.

   This is NeuroVault's thesis in motion — memories appearing,
   each one connecting to what came before. Vanilla canvas, no
   deps, theme-aware (reads data-theme), respects reduced-motion.
   Usage: NVGrow.init('#nv-brain');
   ============================================================ */
(function (root) {
  'use strict';

  // tiny seeded PRNG so the same shape isn't reused but stays well-behaved
  function rnd() { return Math.random(); }

  function init(sel, opts) {
    var cv = document.querySelector(sel);
    if (!cv || !cv.getContext) return;
    opts = opts || {};
    var ctx = cv.getContext('2d');
    var reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- geometry / state ----------------------------------------------
    var W, H, S, cx, cy, dpr;
    var nodes = [];      // {nx,ny, r, born, depth, kids, parent, bob}
    var edges = [];      // {a,b, born, dur}
    var pulses = [];     // {a,b, t, sp}
    var start = performance.now();
    var lastSpawn = 0;
    var MAX = 120;       // recomputed on resize by area
    var SPAWN_EVERY = opts.spawnEvery || 95; // ms between sprouts during growth
    var BASE_STEP = opts.baseStep || 0.082;
    var MIN_DIST = opts.minDist || 0.052;
    var DENSITY = opts.density || 9000;      // lower = more nodes per px²
    var LOOP = !!opts.loop;                  // regrow from scratch on a cycle
    var HOLD = opts.hold || 4800;            // ms to admire the grown web before regrow
    var grown = false, grownAt = 0;
    var mx = 0, my = 0, mActive = false; // cursor in px (for parallax)

    function resize() {
      var r = cv.getBoundingClientRect();
      dpr = Math.min(root.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = Math.min(W, H);
      cx = W / 2; cy = H / 2;
      // scale node budget to the canvas so big screens feel fuller
      MAX = opts.max || Math.max(70, Math.min(180, Math.round((W * H) / DENSITY)));
    }

    function theme() {
      return root.document.documentElement.getAttribute('data-theme') === 'light'
        ? 'light' : 'dark';
    }

    // half-extent of the drawable field in normalised units (1 = S)
    function bounds() {
      return { x: (W / S) * 0.5 * 0.94, y: 0.5 * 0.92 };
    }

    function addNode(nx, ny, depth, parent) {
      var n = { nx: nx, ny: ny, r: 0, born: performance.now(), depth: depth,
                kids: 0, parent: parent, bob: rnd() * 6.2832 };
      nodes.push(n);
      if (parent != null) {
        nodes[parent].kids++;
        edges.push({ a: parent, b: nodes.length - 1, born: performance.now(), dur: 430 });
      }
      return nodes.length - 1;
    }

    // pick a parent that keeps the tree branching outward and balanced:
    // mostly from the recent frontier (so it reaches outward), sometimes
    // an older interior node with few children (so side-branches fill in).
    function pickParent() {
      var n = nodes.length;
      if (rnd() < 0.72) {
        // frontier: bias to the most-recent quarter, favour few children
        var lo = Math.max(0, n - Math.ceil(n * 0.28));
        var best = -1, bestW = -1;
        for (var t = 0; t < 6; t++) {
          var i = lo + ((rnd() * (n - lo)) | 0);
          var w = (1 / (1 + nodes[i].kids * nodes[i].kids)) * (0.5 + rnd());
          if (w > bestW) { bestW = w; best = i; }
        }
        return best;
      }
      // interior side-branch
      var idx = (rnd() * n) | 0, tries = 0;
      while (nodes[idx].kids > 2 && tries++ < 5) idx = (rnd() * n) | 0;
      return idx;
    }

    var stall = 0;
    function trySprout() {
      if (nodes.length >= MAX) { grown = true; return; }
      var before = nodes.length;
      var pIdx = pickParent();
      var p = nodes[pIdx];
      var bnd = bounds();
      // outward direction: radial from centre + angular fan; random near core
      var rad = Math.sqrt(p.nx * p.nx + p.ny * p.ny);
      var baseAng = rad > 0.04 ? Math.atan2(p.ny, p.nx) : rnd() * 6.2832;
      for (var attempt = 0; attempt < 7; attempt++) {
        var ang = baseAng + (rnd() - 0.5) * (rad > 0.04 ? 1.9 : 6.2832);
        var step = BASE_STEP * (0.7 + rnd() * 0.7);
        var nx = p.nx + Math.cos(ang) * step;
        var ny = p.ny + Math.sin(ang) * step;
        if (Math.abs(nx) > bnd.x || Math.abs(ny) > bnd.y) continue;
        // spacing: reject if too close to an existing node
        var ok = true;
        for (var j = 0; j < nodes.length; j++) {
          var ddx = nodes[j].nx - nx, ddy = nodes[j].ny - ny;
          if (ddx * ddx + ddy * ddy < MIN_DIST * MIN_DIST) { ok = false; break; }
        }
        if (ok) { addNode(nx, ny, p.depth + 1, pIdx); stall = 0; return; }
      }
      // crowded — after several stalled beats, consider the web fully grown
      if (nodes.length === before && ++stall > 18) grown = true;
    }

    function buildInstant() { // reduced-motion: grow silently, no animation
      var guard = 0;
      while (nodes.length < MAX && guard++ < MAX * 12) trySprout();
      for (var i = 0; i < nodes.length; i++) nodes[i].r = 1;
      for (var e = 0; e < edges.length; e++) edges[e].born = -10000;
      grown = true;
    }

    function nodeRadius(n, tnow) {
      // hubs (many children, shallow) read bigger — echoes the app's
      // "bigger nodes for what gets referenced most".
      var base = 1.7 + Math.min(3.2, n.kids * 0.6);
      var age = (tnow - n.born) / 480;
      var pop = age >= 1 ? 1 : (function (x) { // easeOutBack
        var c1 = 1.70158, c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
      })(Math.max(0, age));
      return base * Math.max(0, pop) * (S / 680);
    }

    function frame(now) {
      var t = (now - start);
      ctx.clearRect(0, 0, W, H);
      var th = theme();

      // ---- grow -------------------------------------------------------
      if (!grown && !reduce) {
        if (t - lastSpawn > SPAWN_EVERY) {
          trySprout();
          lastSpawn = t;
        }
      } else if (grown && LOOP && !reduce) {
        // looping showcase: admire the finished web, then regrow from seed
        if (!grownAt) grownAt = now;
        if (now - grownAt > HOLD) {
          nodes = []; edges = []; pulses = [];
          grown = false; grownAt = 0; stall = 0;
          addNode(0, 0, 0, null);
          start = now; lastSpawn = -SPAWN_EVERY;
        }
      }
      // fade the whole graph in at birth and out before a loop reset
      var fade = 1;
      if (LOOP && !reduce) {
        fade = Math.min(1, (now - start) / 700);
        if (grownAt) fade = Math.min(fade, Math.max(0, 1 - (now - grownAt - (HOLD - 700)) / 700));
      }
      ctx.globalAlpha = fade;

      // ---- parallax: whole graph leans toward cursor ------------------
      var px = 0, py = 0;
      if (mActive && !reduce) {
        px = ((mx - cx) / W) * 26;
        py = ((my - cy) / H) * 26;
      }
      function SX(n) { return cx + n.nx * S + px * (0.4 + n.depth * 0.05); }
      function SY(n) { return cy + n.ny * S + py * (0.4 + n.depth * 0.05); }

      // breathing bob once grown
      var breathe = grown && !reduce;

      // ---- edges (draw outward as they're born) -----------------------
      var lineCol = th === 'light' ? '47,123,246' : '96,165,255';
      ctx.lineCap = 'round';
      for (var i = 0; i < edges.length; i++) {
        var ed = edges[i];
        var a = nodes[ed.a], bn = nodes[ed.b];
        var grow = ed.born < 0 ? 1 : Math.min(1, (now - ed.born) / ed.dur);
        grow = 1 - Math.pow(1 - grow, 3); // easeOutCubic
        var ax = SX(a), ay = SY(a), bx = SX(bn), by = SY(bn);
        if (breathe) {
          ay += Math.sin(now / 1400 + a.bob) * 0.8;
          by += Math.sin(now / 1400 + bn.bob) * 0.8;
        }
        var ex = ax + (bx - ax) * grow, ey = ay + (by - ay) * grow;
        ctx.lineWidth = 1.1;
        ctx.strokeStyle = 'rgba(' + lineCol + ',' + (th === 'light' ? 0.30 : 0.26) + ')';
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke();
        // bright spark riding the tip while the edge is still drawing
        if (grow < 1) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = 'rgba(' + (th === 'light' ? '37,99,235' : '180,215,255') + ',0.95)';
          ctx.beginPath(); ctx.arc(ex, ey, 2.6, 0, 6.2832); ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        }
      }

      // ---- firing signals along finished edges ------------------------
      if (!reduce && grown && edges.length && rnd() < 0.5) {
        var ei = (rnd() * edges.length) | 0;
        pulses.push({ a: edges[ei].a, b: edges[ei].b, t: 0, sp: 0.02 + rnd() * 0.02 });
      }
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1.5;
      for (i = pulses.length - 1; i >= 0; i--) {
        var pu = pulses[i]; pu.t += pu.sp;
        if (pu.t >= 1) { pulses.splice(i, 1); continue; }
        var na = nodes[pu.a], nb = nodes[pu.b];
        var nax = SX(na), nay = SY(na), nbx = SX(nb), nby = SY(nb);
        var t1 = pu.t, t0 = Math.max(0, pu.t - 0.22);
        var glow = 1 - Math.abs(0.5 - pu.t) * 2;
        ctx.strokeStyle = 'rgba(' + (th === 'light' ? '37,99,235' : '150,205,255') + ',' + (0.75 * glow) + ')';
        ctx.beginPath();
        ctx.moveTo(nax + (nbx - nax) * t0, nay + (nby - nay) * t0);
        ctx.lineTo(nax + (nbx - nax) * t1, nay + (nby - nay) * t1);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';

      // ---- nodes ------------------------------------------------------
      for (i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var x = SX(n), y = SY(n);
        if (breathe) y += Math.sin(now / 1400 + n.bob) * 0.8;
        var r = reduce ? (1.4 * (S / 760) + Math.min(2.4, n.kids * 0.45) * (S / 760)) : nodeRadius(n, now);
        if (r <= 0) continue;
        var hub = n.kids >= 2 || n.depth === 0;
        // soft halo first (under the dot) — gives hubs presence
        if (hub) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = th === 'light' ? 'rgba(47,123,246,0.16)' : 'rgba(90,160,255,0.20)';
          ctx.beginPath(); ctx.arc(x, y, r * 3.6, 0, 6.2832); ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        }
        if (hub) {
          ctx.fillStyle = th === 'light' ? 'rgba(37,99,235,0.98)' : 'rgba(96,165,255,1)';
        } else {
          ctx.fillStyle = th === 'light' ? 'rgba(60,110,205,0.82)' : 'rgba(212,230,255,0.92)';
        }
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
      }

      requestAnimationFrame(frame);
    }

    resize();
    addNode(0, 0, 0, null); // the seed
    if (reduce) buildInstant();

    root.addEventListener('resize', resize);
    if (!reduce) {
      root.addEventListener('mousemove', function (ev) {
        var r = cv.getBoundingClientRect();
        mx = ev.clientX - r.left; my = ev.clientY - r.top;
        mActive = true;
      });
      root.addEventListener('mouseout', function () { mActive = false; });
    }
    requestAnimationFrame(frame);
  }

  root.NVGrow = { init: init };
})(typeof window !== 'undefined' ? window : this);
