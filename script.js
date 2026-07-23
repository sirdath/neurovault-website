(() => {
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector(".menu-button");
  const menu = document.querySelector(".site-menu");

  const syncHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  const closeMenu = () => {
    if (!menuButton || !menu) return;
    menuButton.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  };

  menuButton?.addEventListener("click", () => {
    const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(willOpen));
    menu?.classList.toggle("is-open", willOpen);
  });

  menu?.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuButton.focus();
    }
  });

  const productCarousel = document.querySelector("[data-product-carousel]");

  if (productCarousel) {
    const viewport = productCarousel.querySelector("[data-carousel-viewport]");
    const slides = Array.from(productCarousel.querySelectorAll("[data-carousel-slide]"));
    const previousButton = productCarousel.querySelector("[data-carousel-prev]");
    const nextButton = productCarousel.querySelector("[data-carousel-next]");
    const status = productCarousel.querySelector("[data-carousel-status]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let activeIndex = 0;
    let scrollFrame = 0;

    const stride = () => {
      if (slides.length < 2) return slides[0]?.getBoundingClientRect().width || 0;
      return slides[1].offsetLeft - slides[0].offsetLeft;
    };

    const visibleCount = () => {
      const step = stride();
      if (!viewport || !step) return 1;
      return Math.max(1, Math.min(slides.length, Math.floor((viewport.clientWidth + 2) / step)));
    };

    const maximumStart = () => Math.max(0, slides.length - visibleCount());

    const syncCarousel = () => {
      if (!viewport || !slides.length) return;
      const step = stride();
      activeIndex = step ? Math.min(maximumStart(), Math.max(0, Math.round(viewport.scrollLeft / step))) : 0;
      const lastVisible = Math.min(slides.length, activeIndex + visibleCount());

      slides.forEach((slide, index) => {
        if (index === activeIndex) slide.setAttribute("aria-current", "true");
        else slide.removeAttribute("aria-current");
      });

      if (status) status.textContent = `Views ${activeIndex + 1}${lastVisible > activeIndex + 1 ? `–${lastVisible}` : ""} of ${slides.length}`;
      if (previousButton instanceof HTMLButtonElement) previousButton.disabled = activeIndex === 0;
      if (nextButton instanceof HTMLButtonElement) nextButton.disabled = activeIndex >= maximumStart();
    };

    const goToSlide = (index) => {
      if (!viewport || !slides.length) return;
      const boundedIndex = Math.min(maximumStart(), Math.max(0, index));
      viewport.scrollTo({
        left: Math.min(slides[boundedIndex].offsetLeft, viewport.scrollWidth - viewport.clientWidth),
        behavior: reduceMotion.matches ? "auto" : "smooth",
      });
    };

    previousButton?.addEventListener("click", () => goToSlide(activeIndex - 1));
    nextButton?.addEventListener("click", () => goToSlide(activeIndex + 1));

    viewport?.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "ArrowLeft") goToSlide(activeIndex - 1);
      if (event.key === "ArrowRight") goToSlide(activeIndex + 1);
      if (event.key === "Home") goToSlide(0);
      if (event.key === "End") goToSlide(maximumStart());
    });

    viewport?.addEventListener("scroll", () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(syncCarousel);
    }, { passive: true });

    window.addEventListener("resize", syncCarousel, { passive: true });
    syncCarousel();
  }

  const toast = document.querySelector("[data-copy-toast]");
  let toastTimer;

  const showCopyState = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
  };

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.getAttribute("data-copy");
      if (!value) return;

      try {
        await navigator.clipboard.writeText(value);
        showCopyState("Clone command copied");
      } catch {
        showCopyState("Copy unavailable. Select the command manually.");
      }
    });
  });

  /*
   * The live site's original woven memory field, intentionally rendered as
   * one still frame. It keeps the archival identity without restoring the
   * old 220vh scroll hijack or an always-running animation loop.
   */
  const sculpture = document.getElementById("sculpture");

  if (sculpture instanceof HTMLCanvasElement) {
    const context = sculpture.getContext("2d");
    let resizeFrame = 0;

    const mulberry32 = (seed) => () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
      value = (value + Math.imul(value ^ value >>> 7, 61 | value)) ^ value;
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };

    const drawArchiveField = () => {
      if (!context) return;

      const width = sculpture.clientWidth;
      const height = sculpture.clientHeight;
      if (!width || !height) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const compact = window.matchMedia("(max-width: 720px)").matches;
      const rows = compact ? 46 : 88;
      const particleCount = compact ? 320 : 700;
      const step = compact ? 18 : 13;
      const random = mulberry32(499);

      sculpture.width = Math.round(width * dpr);
      sculpture.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const rowOpacity = Array.from(
        { length: rows },
        () => 0.055 + random() * 0.105,
      );

      const field = (unitX, row) => {
        const envelope = Math.sin(
          Math.PI * Math.min(1, Math.max(0, row / (rows - 1))),
        );
        return envelope * (
          Math.sin(unitX * 6.2 + row * 0.21)
          + 0.62 * Math.sin(unitX * 14.7 - row * 0.11 + 1.7)
          + 0.35 * Math.sin(unitX * 29 + row * 0.043 + 4.2)
        );
      };

      const particles = [];
      let attempts = 0;
      while (particles.length < particleCount && attempts < particleCount * 60) {
        attempts += 1;
        const unitX = random();
        const row = random() * (rows - 1);
        const value = field(unitX, row);
        const acceptance = 0.14 + 0.86 * Math.max(0, value / 1.97);

        if (random() < acceptance) {
          particles.push({
            unitX,
            row,
            jitter: (random() - 0.5) * 10,
            drift: (random() * 0.5 + 0.2) * 0.0000045,
            blue: random() < 0.09,
          });
        }
      }

      const amplitude = height * 0.105;
      context.lineWidth = 1;

      for (let row = 0; row < rows; row += 1) {
        context.strokeStyle = row % 11 === 3
          ? `rgba(47,123,246,${Math.min(0.3, rowOpacity[row] * 2.1).toFixed(3)})`
          : `rgba(11,14,20,${rowOpacity[row].toFixed(3)})`;
        context.beginPath();

        const baseline = height * (0.18 + 0.64 * row / (rows - 1));
        let firstPoint = true;
        for (let x = -8; x <= width + 8; x += step) {
          const y = baseline + field(x / width, row) * amplitude;
          if (firstPoint) {
            context.moveTo(x, y);
            firstPoint = false;
          } else {
            context.lineTo(x, y);
          }
        }
        context.stroke();
      }

      particles.forEach((particle) => {
        const value = field(particle.unitX, particle.row);
        const x = particle.unitX * width;
        const y = height * (0.18 + 0.64 * particle.row / (rows - 1))
          + value * amplitude
          + particle.jitter;
        const opacity = 0.14 + 0.34 * Math.max(0, value / 1.97);

        context.fillStyle = particle.blue
          ? `rgba(47,123,246,${Math.min(0.62, opacity * 1.5).toFixed(3)})`
          : `rgba(11,14,20,${opacity.toFixed(3)})`;
        context.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
      });
    };

    const queueArchiveField = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(drawArchiveField);
    };

    queueArchiveField();
    window.addEventListener("resize", queueArchiveField, { passive: true });
  }
})();
