/* NeuroVault public-site behaviour. No framework or build step. */

(() => {
  "use strict";

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((element) => observer.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add("is-in"));
  }

  document.querySelectorAll(".feature").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
      card.style.setProperty("--my", `${event.clientY - bounds.top}px`);
    });
  });

  const THEME_KEY = "nv.theme";
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "light" ? "#f5f8fd" : "#0b0b12");
    }
  }

  let storedTheme = null;
  try { storedTheme = localStorage.getItem(THEME_KEY); } catch { /* storage optional */ }
  applyTheme(storedTheme === "light" ? "light" : "dark");

  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.checked = root.getAttribute("data-theme") === "light";
    toggle.addEventListener("change", () => {
      const nextTheme = toggle.checked ? "light" : "dark";
      applyTheme(nextTheme);
      try { localStorage.setItem(THEME_KEY, nextTheme); } catch { /* storage optional */ }
    });
  }

  const bar = document.querySelector(".scroll-progress");
  if (bar) {
    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const percent = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      bar.style.width = `${percent.toFixed(2)}%`;
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }
})();

/* Animated Core quickstart for layouts that provide #nv-term-out. */
(() => {
  "use strict";
  const output = document.getElementById("nv-term-out");
  if (!output) return;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const lines = [
    ["comment", "# 1 · build the open Core from source"],
    ["cmd", "git clone https://github.com/sirdath/neurovault-core.git"],
    ["cmd", "cd neurovault-core"],
    ["cmd", "cargo build --release --bin neurovault-server"],
    ["ok", "✓ local engine and MCP server built"],
    ["blank", ""],
    ["comment", "# 2 · optional automatic context for Claude Code"],
    ["cmd", "./target/release/neurovault-server hook install"],
    ["ok", "✓ local hooks installed (fail-open)"],
    ["blank", ""],
    ["comment", "# MCP clients use explicit recall/remember tools separately"],
  ];

  const span = (className, text) => {
    const element = document.createElement("span");
    if (className) element.className = className;
    element.textContent = text;
    return element;
  };
  const newline = () => document.createTextNode("\n");
  const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

  function appendLine(kind, text) {
    if (kind === "blank") {
      output.appendChild(newline());
      return null;
    }
    if (kind === "cmd") output.appendChild(span("nv-t-prompt", "$ "));
    const className = kind === "comment" ? "nv-t-comment" : kind === "ok" ? "nv-t-ok" : "nv-t-cmd";
    const node = span(className, text);
    output.appendChild(node);
    output.appendChild(newline());
    return node;
  }

  function renderInstantly() {
    output.textContent = "";
    lines.forEach(([kind, text]) => appendLine(kind, text));
  }

  async function play() {
    output.textContent = "";
    for (const [kind, text] of lines) {
      if (kind !== "cmd") {
        appendLine(kind, text);
        await pause(kind === "blank" ? 120 : 180);
        continue;
      }
      const node = appendLine(kind, "");
      for (const character of text) {
        node.textContent += character;
        await pause(character === " " ? 30 : 18);
      }
      await pause(130);
    }
  }

  if (reducedMotion) {
    renderInstantly();
    return;
  }

  const host = output.closest(".nv-terminal") || output;
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        play();
      }
    }, { threshold: 0.35 });
    observer.observe(host);
  } else {
    play();
  }
})();
