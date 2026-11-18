/* ============================================================
   ALLI IBRAHIM — PORTFOLIO INTERACTIONS
   - theme switch (persisted)
   - mobile navigation
   - smooth anchor scrolling + active link tracking
   - scroll reveal animations
   - animated statistics
   - rotating hero role text
   - copy-to-clipboard with toast feedback
   - back-to-top control
   ============================================================ */

(function () {
  "use strict";

  /* Enable reveal styles only when JavaScript is running */
  document.documentElement.classList.add("js");

  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const themeToggle = document.getElementById("themeToggle");
  const toTop = document.getElementById("toTop");
  const toast = document.getElementById("toast");

  /* ---------------------------------------------------------
     1. Theme switch
     --------------------------------------------------------- */
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeMeta) {
      themeMeta.setAttribute("content", theme === "light" ? "#f6f8fd" : "#080c18");
    }
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
    }
  }

  let savedTheme = null;
  try { savedTheme = localStorage.getItem("portfolio-theme"); } catch (e) { /* storage unavailable */ }
  applyTheme(savedTheme === "light" ? "light" : "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      try { localStorage.setItem("portfolio-theme", next); } catch (e) { /* ignore */ }
      showToast(next === "light" ? "Light theme enabled" : "Dark theme enabled");
    });
  }

  /* ---------------------------------------------------------
     2. Mobile navigation
     --------------------------------------------------------- */
  function closeMenu() {
    body.classList.remove("nav-open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      const isOpen = body.classList.toggle("nav-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", function (event) {
    if (body.classList.contains("nav-open") &&
        !event.target.closest(".nav-links") &&
        !event.target.closest("#menuToggle")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) closeMenu();
  });

  /* ---------------------------------------------------------
     3. Smooth anchor scrolling
     --------------------------------------------------------- */
  const navAnchors = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));

  navAnchors.forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;

      window.scrollTo({
        top: Math.max(top, 0),
        behavior: reduceMotion ? "auto" : "smooth"
      });

      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", hash);
      }
      closeMenu();
    });
  });

  /* ---------------------------------------------------------
     4. Header state + back-to-top visibility
     --------------------------------------------------------- */
  let scrollTicking = false;

  function onScroll() {
    const y = window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 24);
    if (toTop) toTop.classList.toggle("show", y > 600);
    scrollTicking = false;
  }

  window.addEventListener("scroll", function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(onScroll);
      scrollTicking = true;
    }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------------------------------------------------
     5. Scroll reveal
     --------------------------------------------------------- */
  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------
     6. Animated statistics
     --------------------------------------------------------- */
  const statNumbers = document.querySelectorAll("[data-count]");

  function animateCount(element) {
    const target = parseInt(element.getAttribute("data-count"), 10) || 0;
    const suffix = element.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      element.textContent = target + suffix;
      return;
    }

    const duration = 1500;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window) {
    const statObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    statNumbers.forEach(function (number) { statObserver.observe(number); });
  } else {
    statNumbers.forEach(animateCount);
  }

  /* ---------------------------------------------------------
     7. Rotating role text in the hero
     --------------------------------------------------------- */
  const typedText = document.getElementById("typedText");
  const phrases = [
    "AI Evaluation Specialist",
    "Quality Review Expert",
    "Software Testing Advocate",
    "Mathematics & Algorithm Specialist"
  ];

  if (typedText && !reduceMotion) {
    let phraseIndex = 0;
    let charIndex = phrases[0].length;
    let deleting = true;

    function typeStep() {
      const phrase = phrases[phraseIndex];

      if (deleting) {
        charIndex -= 1;
        typedText.textContent = phrase.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          window.setTimeout(typeStep, 350);
          return;
        }
        window.setTimeout(typeStep, 32);
      } else {
        charIndex += 1;
        typedText.textContent = phrase.slice(0, charIndex);
        if (charIndex === phrase.length) {
          deleting = true;
          window.setTimeout(typeStep, 2200);
          return;
        }
        window.setTimeout(typeStep, 68);
      }
    }

    window.setTimeout(typeStep, 2600);
  }

  /* ---------------------------------------------------------
     8. Copy to clipboard + toast
     --------------------------------------------------------- */
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 2600);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      // Fallback for non-secure contexts
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      const success = document.execCommand("copy");
      document.body.removeChild(helper);
      return success;
    } catch (error) {
      return false;
    }
  }

  document.querySelectorAll(".copy-btn").forEach(function (button) {
    button.addEventListener("click", async function () {
      const value = button.getAttribute("data-copy") || "";
      const success = await copyText(value);
      if (!success) {
        showToast("Couldn't copy — please select the text manually.");
        return;
      }

      const use = button.querySelector("use");
      const originalIcon = use ? use.getAttribute("href") : null;
      if (use) use.setAttribute("href", "#i-check");
      button.style.color = "var(--accent-3)";
      showToast("Copied to clipboard!");

      window.setTimeout(function () {
        if (use && originalIcon) use.setAttribute("href", originalIcon);
        button.style.color = "";
      }, 1800);
    });
  });

  /* ---------------------------------------------------------
     9. Active navigation link tracking
     --------------------------------------------------------- */
  const sectionLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  const sections = sectionLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  function setActiveLink(id) {
    sectionLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + id);
    });
  }

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(function (entries) {
      const visible = entries
        .filter(function (entry) { return entry.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
      if (visible.length) setActiveLink(visible[0].target.id);
    }, {
      rootMargin: "-30% 0px -55% 0px",
      threshold: [0, 0.15, 0.35, 0.6]
    });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ---------------------------------------------------------
     10. Footer year
     --------------------------------------------------------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
