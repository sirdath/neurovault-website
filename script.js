/*
 * NeuroVault landing page — runtime behaviour.
 *   1. Detect the visitor's OS and relabel the primary download buttons.
 *   2. Reveal-on-scroll for sections (IntersectionObserver).
 *   3. Top scroll-progress bar.
 * No framework, no build step. Kept deliberately small.
 */

(() => {
  "use strict";

  // ----- OS detection ------------------------------------------------------
  // navigator.platform is deprecated but still reliable across evergreen
  // browsers; userAgent is the stable fallback.
  const ua = (navigator.userAgent || "").toLowerCase();
  const platform = (navigator.platform || "").toLowerCase();

  let os = "windows";
  if (/mac/.test(platform) || /mac os x/.test(ua) || /iphone|ipad|ipod/.test(ua)) {
    os = "macos";
  } else if (/linux/.test(platform) && !/android/.test(ua)) {
    os = "linux";
  } else if (/android/.test(ua)) {
    os = "android";
  }

  // Fallback: the releases page (always works). The GitHub API lookup below
  // upgrades this to a direct `.exe` URL so clicks trigger a download instead
  // of opening a page where the user has to hunt for the asset.
  const WINDOWS_LATEST = "https://github.com/sirdath/NeuroVault/releases/latest";
  const RELEASES_PAGE  = "https://github.com/sirdath/NeuroVault/releases";
  const REPO_SOURCE    = "https://github.com/sirdath/NeuroVault#for-developers";
  const GH_API_LATEST  = "https://api.github.com/repos/sirdath/NeuroVault/releases/latest";

  // Pick the right release asset for the visitor's OS. Patterns match
  // Tauri's bundle output filenames (NSIS for Windows, DMG for macOS,
  // AppImage / DEB for Linux). When the asset for the current OS isn't
  // present yet (e.g. v0.1.1 only has Windows; macOS + Linux ship in
  // v0.1.2 once the cross-platform CI workflow runs), we just don't
  // upgrade the link — the static markup href (the releases page) already
  // points somewhere valid.
  function pickAssetForOs(assets, forOs = os) {
    // Apple Silicon detection is approximate via `userAgent` — Apple
    // doesn't expose CPU directly; we detect via Safari + macOS
    // heuristics. Default to arm64 since that's what most modern Macs
    // are; users on Intel Macs whose UA happens to look "modern" can
    // grab the x64 .dmg from the releases page.
    const macIsArm = /Mac/.test(platform) && (
      /Mac OS X 1[5-9]/.test(ua) ||  // Sequoia+ ships only on Apple Silicon
      window.matchMedia?.("(prefers-color-scheme: dark)") !== null  // weak signal
    );
    let pattern;
    if (forOs === "windows") {
      pattern = /_x64-setup\.exe$/i;
    } else if (forOs === "macos") {
      pattern = macIsArm ? /_aarch64\.dmg$/i : /_x64\.dmg$/i;
    } else if (forOs === "linux") {
      // Prefer AppImage (universally runnable); fall back to .deb if
      // only that's there.
      const app = assets.find(
        (a) => typeof a.name === "string" && /\.AppImage$/i.test(a.name)
      );
      if (app) return app;
      pattern = /_amd64\.deb$/i;
    } else {
      return null;
    }
    return (
      assets.find((a) => typeof a.name === "string" && pattern.test(a.name)) ?? null
    );
  }

  function osLabel(forOs = os) {
    if (forOs === "windows") return "Windows";
    if (forOs === "macos")   return "macOS";
    if (forOs === "linux")   return "Linux";
    return "your platform";
  }

  // Ask the GitHub API for the latest release, pick the asset matching
  // the visitor's OS, and rewrite the download buttons to point directly
  // at it. On failure (rate-limit, offline, API outage, or asset not
  // present yet) the static markup (label + releases-page href) stands.
  async function resolveDirectInstaller(forOs = os) {
    try {
      const res = await fetch(GH_API_LATEST, {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!res.ok) return null;
      const data = await res.json();
      const assets = Array.isArray(data.assets) ? data.assets : [];
      const asset = pickAssetForOs(assets, forOs);
      if (!asset || !asset.browser_download_url) return null;
      const mb = asset.size ? (asset.size / (1024 * 1024)).toFixed(1) : null;
      const kind =
        /\.exe$/i.test(asset.name) ? "x64 installer"
        : /\.dmg$/i.test(asset.name) ? (/aarch64/i.test(asset.name) ? "Apple Silicon (M1 / M2 / M3 / M4) · DMG" : "Intel · DMG")
        : /\.AppImage$/i.test(asset.name) ? "x64 AppImage"
        : /\.deb$/i.test(asset.name) ? "x64 DEB"
        : "installer";
      return {
        url: asset.browser_download_url,
        label: `Download for ${osLabel(forOs)}`,
        sizeLabel: mb ? `${mb} MB · ${kind}` : kind,
        version: data.tag_name || "",
      };
    } catch {
      return null;
    }
  }

  function applyDirectInstaller(direct) {
    if (!direct) return;
    const primaryAnchor = document.getElementById("primary-download");
    const primaryLabel  = document.getElementById("primary-label");
    const primarySub    = document.getElementById("primary-sub");
    if (primaryAnchor) primaryAnchor.href = direct.url;
    if (primaryLabel) primaryLabel.textContent = direct.label;
    if (primarySub) primarySub.textContent = direct.sizeLabel;

    const ctaLabel = document.getElementById("cta-label");
    if (ctaLabel) {
      ctaLabel.textContent = direct.label;
      const ctaAnchor = ctaLabel.closest("a");
      if (ctaAnchor) ctaAnchor.href = direct.url;
    }
  }

  // Resolve the Apple Silicon DMG asset specifically and wire both
  // glass Mac buttons (hero + bottom CTA) to the direct download URL.
  // Always-on regardless of visitor OS, so a Windows user sharing the
  // page with a Mac friend gets a working button.
  async function applyMacDirectDownload() {
    try {
      const res = await fetch(GH_API_LATEST, {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!res.ok) return;
      const data = await res.json();
      const assets = Array.isArray(data.assets) ? data.assets : [];
      const dmg = assets.find(
        (a) => typeof a.name === "string" && /_aarch64\.dmg$/i.test(a.name)
      );
      if (!dmg || !dmg.browser_download_url) return;
      const mb = dmg.size ? (dmg.size / (1024 * 1024)).toFixed(1) : null;
      const sub = mb ? `${mb} MB · Apple Silicon (M1 / M2 / M3 / M4)` : "Apple Silicon (M1 / M2 / M3 / M4) · DMG";
      const targets = [
        { a: "mac-download", l: "mac-label", s: "mac-sub" },
        { a: "cta-mac-download", l: "cta-mac-label", s: "cta-mac-sub" },
      ];
      for (const t of targets) {
        const anchor = document.getElementById(t.a);
        const subEl  = document.getElementById(t.s);
        if (anchor) anchor.href = dmg.browser_download_url;
        if (subEl)  subEl.textContent = sub;
      }
    } catch {
      /* keep the /releases/latest fallback already in the markup */
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Two explicit download buttons, always shown: the primary is the
    // **Windows** installer; the glass button is the **macOS** DMG. (We used
    // to make the primary auto-detect the visitor's OS, which on a Mac
    // duplicated the dedicated Mac button — two "Download for Mac" CTAs.)
    // The markup already labels the primary "Download for Windows"; below we
    // just upgrade each to a direct download URL when the GitHub API answers.
    resolveDirectInstaller("windows").then(applyDirectInstaller); // primary + bottom CTA -> .exe
    applyMacDirectDownload();                                     // glass buttons -> .dmg

    // Mac visitors get a small "On an Intel Mac?" escape hatch — the browser
    // doesn't expose CPU arch on macOS, so we surface it for anyone on Mac.
    if (os === "macos") {
      const intelHint = document.getElementById("intel-mac-hint");
      if (intelHint) intelHint.hidden = false;
    }
  });

  // ----- Reveal on scroll --------------------------------------------------
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    // Graceful fallback — just show everything on very old browsers.
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // ----- Spotlight mouse-follow on every feature card ---------------------
  // Sets --mx/--my CSS vars on the hovered card so the radial gradient
  // (.feature::after) tracks the cursor. Pattern from frontendmaxxing/effects.
  document.querySelectorAll(".feature").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // ----- Theme toggle: dark (default) ↔ light ------------------------------
  // Persisted to localStorage so the choice survives reloads (and an early
  // inline block in the page <head> applies it before first paint).
  const THEME_KEY = "nv.theme";
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f5f8fd" : "#0b0b12");
  }

  const stored = (() => {
    try { return localStorage.getItem(THEME_KEY); } catch { return null; }
  })();
  applyTheme(stored === "light" ? "light" : "dark");

  // The toggle is a checkbox driving the animated sun/moon SVG.
  // Convention: checked = sun = light mode; unchecked = moon = dark mode.
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.checked = root.getAttribute("data-theme") === "light";
    toggle.addEventListener("change", () => {
      const next = toggle.checked ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore quota */ }
    });
  }

  // ----- Scroll progress bar ----------------------------------------------
  const bar = document.querySelector(".scroll-progress");
  if (bar) {
    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      bar.style.width = pct.toFixed(2) + "%";
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }
})();

/* ---- Animated install terminal ----------------------------------------
 * Types out the real flow — download → connect your agent → it remembers —
 * into the hero terminal. Starts when scrolled into view, loops, and
 * respects prefers-reduced-motion (renders the final frame, no typing).
 */
(() => {
  "use strict";
  const out = document.getElementById("nv-term-out");
  if (!out) return;
  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // [kind, text] — kind: comment | cmd | cont | ask | ok | arrow | blank
  const SCRIPT = [
    ["comment", "# 1 · download — one file, no account, no cloud"],
    ["cmd", "open NeuroVault_0.5.2_aarch64.dmg"],
    ["blank", ""],
    ["comment", "# 2 · connect your agent — one line"],
    ["cmd", "claude mcp add --scope user neurovault \\"],
    ["cont", "      neurovault-server -- --mcp-only"],
    ["ok", "✓ neurovault connected"],
    ["blank", ""],
    ["comment", "# 3 · now it remembers — across every session"],
    ["ask", 'remember "we ship releases from main, never a branch"'],
    ["ok", "✓ saved to your vault"],
    ["ask", 'recall "how do we release?"'],
    ["arrow", "→ You ship from main — never a branch."],
  ];

  const mk = (cls, text) => {
    const s = document.createElement("span");
    if (cls) s.className = cls;
    s.textContent = text;
    return s;
  };
  const nl = () => document.createTextNode("\n");
  const promptSym = (k) => (k === "ask" ? "› " : "$ ");
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function renderInstant() {
    out.textContent = "";
    for (const [kind, text] of SCRIPT) {
      if (kind === "blank") { out.appendChild(nl()); continue; }
      if (kind === "cmd" || kind === "ask") out.appendChild(mk("nv-t-prompt", promptSym(kind)));
      const cls =
        kind === "comment" ? "nv-t-comment" :
        kind === "ok" ? "nv-t-ok" :
        kind === "arrow" ? "nv-t-arrow" : "nv-t-cmd";
      out.appendChild(mk(cls, text));
      out.appendChild(nl());
    }
  }

  async function type(node, text, per) {
    for (let i = 0; i < text.length; i++) {
      node.textContent += text[i];
      await sleep(text[i] === " " ? per + 12 : per);
    }
  }

  let running = false;
  async function play() {
    if (running) return;
    running = true;
    out.textContent = "";
    for (const [kind, text] of SCRIPT) {
      if (kind === "blank") { out.appendChild(nl()); await sleep(120); continue; }
      if (kind === "comment") {
        out.appendChild(mk("nv-t-comment", text));
      } else if (kind === "cmd" || kind === "ask") {
        out.appendChild(mk("nv-t-prompt", promptSym(kind)));
        const node = mk("nv-t-cmd", "");
        out.appendChild(node);
        await sleep(180);
        await type(node, text, 26);
      } else if (kind === "cont") {
        const node = mk("nv-t-cmd", "");
        out.appendChild(node);
        await type(node, text, 24);
      } else if (kind === "ok") {
        await sleep(300);
        out.appendChild(mk("nv-t-ok", text));
      } else if (kind === "arrow") {
        await sleep(320);
        out.appendChild(mk("nv-t-arrow", text));
      }
      out.appendChild(nl());
      await sleep(kind === "comment" ? 170 : 90);
    }
    await sleep(4500);
    running = false;
    play(); // loop
  }

  if (reduce) { renderInstant(); return; }
  const host = out.closest(".nv-terminal") || out;
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { io.disconnect(); play(); }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(host);
  } else {
    play();
  }
})();
