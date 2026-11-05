/**
 * Motion.dev (https://motion.dev) animations for MYK Portfolio
 * Uses Motion for JavaScript (vanilla) — animate(), scroll(), stagger(), spring()
 * Safe version: elements are visible by default, Motion enhances them.
 */

import {
  animate,
  scroll,
  stagger,
  spring,
  inView
} from "https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm";

/* ─────────────────────────────────────────
   HELPER: safely hide elements before animating
   Only called right before we animate, so if
   Motion fails to load the page stays visible.
───────────────────────────────────────── */
function hide(selector) {
  document.querySelectorAll(selector).forEach(el => {
    el.style.opacity = "0";
    el.style.willChange = "opacity, transform";
  });
}
function hideEl(el, extraStyles = {}) {
  if (!el) return;
  el.style.opacity = "0";
  el.style.willChange = "opacity, transform";
  Object.assign(el.style, extraStyles);
}

/* ─────────────────────────────────────────
   1. HERO TITLE — spring slide-in
───────────────────────────────────────── */
hide(".hero-title .line-1");
hide(".hero-title .line-2");

animate(
  ".hero-title .line-1",
  { opacity: [0, 1], x: [-60, 0] },
  { duration: 0.9, easing: spring({ stiffness: 100, damping: 15 }) }
);
animate(
  ".hero-title .line-2",
  { opacity: [0, 1], x: [-60, 0] },
  { duration: 0.9, delay: 0.18, easing: spring({ stiffness: 100, damping: 15 }) }
);

/* ─────────────────────────────────────────
   2. HERO BADGE — bounce scale-in
───────────────────────────────────────── */
hide(".hero-badge");
animate(
  ".hero-badge",
  { opacity: [0, 1], scale: [0.6, 1.05, 1], y: [-10, 0] },
  { duration: 0.7, delay: 0.05, easing: spring({ stiffness: 200, damping: 18 }) }
);

/* ─────────────────────────────────────────
   3. HERO SUBTITLE + LOCATION + DESC + CTA + STATS
───────────────────────────────────────── */
[".hero-subtitle", ".hero-location", ".hero-desc", ".hero-cta", ".hero-stats"].forEach(sel => hide(sel));

animate(
  [".hero-subtitle", ".hero-location", ".hero-desc", ".hero-cta", ".hero-stats"],
  { opacity: [0, 1], y: [24, 0] },
  { duration: 0.65, delay: stagger(0.12, { start: 0.32 }), easing: [0.22, 1, 0.36, 1] }
);

/* ─────────────────────────────────────────
   4. HERO VISUAL — spring scale-in
───────────────────────────────────────── */
hide(".hero-visual");
animate(
  ".hero-visual",
  { opacity: [0, 1], scale: [0.78, 1], x: [40, 0] },
  { duration: 1, delay: 0.4, easing: spring({ stiffness: 80, damping: 14 }) }
);

/* ─────────────────────────────────────────
   5. FLOATING CARDS — spring pop
───────────────────────────────────────── */
document.querySelectorAll(".float-card").forEach((card, i) => {
  hideEl(card);
  animate(
    card,
    { opacity: [0, 1], scale: [0.5, 1.08, 1], y: [20, 0] },
    { duration: 0.6, delay: 0.8 + i * 0.18, easing: spring({ stiffness: 180, damping: 16 }) }
  );
});

/* ─────────────────────────────────────────
   6. NAVBAR logo subtle scale on scroll
───────────────────────────────────────── */
scroll(
  animate(".nav-brand", { scale: [1, 0.9], opacity: [1, 0.8] }, { easing: "ease-in" }),
  { target: document.documentElement, offset: ["0px", "300px"] }
);

/* ─────────────────────────────────────────
   7. SECTION HEADERS — spring bounce inView
───────────────────────────────────────── */
document.querySelectorAll(".section-header").forEach(header => {
  hideEl(header, { transform: "translateY(32px)" });

  inView(header, () => {
    animate(
      header,
      { opacity: [0, 1], y: [32, 0] },
      { duration: 0.75, easing: spring({ stiffness: 90, damping: 16 }) }
    );
  }, { margin: "-80px" });
});

/* ─────────────────────────────────────────
   8. SKILL CARDS — stagger spring pop-in
───────────────────────────────────────── */
document.querySelectorAll(".skill-card").forEach(card => {
  hideEl(card, { transform: "translateY(40px) scale(0.95)" });
});

inView(".skills-grid", () => {
  animate(
    ".skill-card",
    { opacity: [0, 1], y: [40, 0], scale: [0.92, 1] },
    { duration: 0.6, delay: stagger(0.1), easing: spring({ stiffness: 120, damping: 15 }) }
  );
}, { margin: "-60px" });

/* ─────────────────────────────────────────
   9. PROJECT CARDS — stagger slide-up
───────────────────────────────────────── */
document.querySelectorAll(".project-card").forEach(card => {
  hideEl(card, { transform: "translateY(50px)" });
});

inView(".projects-grid", () => {
  animate(
    ".project-card",
    { opacity: [0, 1], y: [50, 0] },
    { duration: 0.65, delay: stagger(0.13), easing: [0.22, 1, 0.36, 1] }
  );
}, { margin: "-60px" });

/* ─────────────────────────────────────────
   10. ABOUT SECTION — split grid reveal
───────────────────────────────────────── */
const aboutText   = document.querySelector(".about-text");
const aboutVisual = document.querySelector(".about-visual");

if (aboutText && aboutVisual) {
  hideEl(aboutText,   { transform: "translateX(-40px)" });
  hideEl(aboutVisual, { transform: "translateX(40px)" });

  inView(".about-grid", () => {
    animate(aboutText,   { opacity: [0, 1], x: [-40, 0] }, { duration: 0.8, easing: spring({ stiffness: 80, damping: 16 }) });
    animate(aboutVisual, { opacity: [0, 1], x: [40, 0] },  { duration: 0.8, delay: 0.15, easing: spring({ stiffness: 80, damping: 16 }) });
  }, { margin: "-60px" });
}

/* ─────────────────────────────────────────
   11. HIGHLIGHT ITEMS — stagger slide from left
───────────────────────────────────────── */
document.querySelectorAll(".highlight-item").forEach(item => {
  hideEl(item, { transform: "translateX(-20px)" });
});

inView(".about-highlights", () => {
  animate(
    ".highlight-item",
    { opacity: [0, 1], x: [-20, 0] },
    { duration: 0.5, delay: stagger(0.12, { start: 0.1 }), easing: spring({ stiffness: 150, damping: 18 }) }
  );
}, { margin: "-40px" });

/* ─────────────────────────────────────────
   12. CONTACT SECTION
───────────────────────────────────────── */
const contactInfo = document.querySelector(".contact-info");
const contactForm = document.querySelector(".contact-form");

if (contactInfo && contactForm) {
  hideEl(contactInfo, { transform: "translateY(30px)" });
  hideEl(contactForm, { transform: "translateY(30px)" });

  inView(".contact-grid", () => {
    animate(contactInfo, { opacity: [0, 1], y: [30, 0] }, { duration: 0.7, easing: spring({ stiffness: 100, damping: 16 }) });
    animate(contactForm, { opacity: [0, 1], y: [30, 0] }, { duration: 0.7, delay: 0.18, easing: spring({ stiffness: 100, damping: 16 }) });
  }, { margin: "-60px" });
}

/* ─────────────────────────────────────────
   13. FOOTER — fade-in
───────────────────────────────────────── */
const footer = document.querySelector(".footer");
if (footer) {
  hideEl(footer, { transform: "translateY(20px)" });
  inView(footer, () => {
    animate(footer, { opacity: [0, 1], y: [20, 0] }, { duration: 0.6, easing: [0.22, 1, 0.36, 1] });
  }, { margin: "-20px" });
}

/* ─────────────────────────────────────────
   14. PROJECT CARD — 3D spring tilt on hover
───────────────────────────────────────── */
document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("mouseenter", () => {
    animate(card, { scale: 1.025, rotateX: 2, rotateY: -2 }, { duration: 0.35, easing: spring({ stiffness: 200, damping: 20 }) });
  });
  card.addEventListener("mouseleave", () => {
    animate(card, { scale: 1, rotateX: 0, rotateY: 0 }, { duration: 0.4, easing: spring({ stiffness: 160, damping: 22 }) });
  });
});

/* ─────────────────────────────────────────
   15. SKILL CARD — icon bounce on hover
───────────────────────────────────────── */
document.querySelectorAll(".skill-card").forEach(card => {
  const icon = card.querySelector(".skill-icon");
  if (!icon) return;
  card.addEventListener("mouseenter", () => {
    animate(icon, { scale: [1, 1.35, 1.2], rotate: [0, -8, 0] }, { duration: 0.5, easing: spring({ stiffness: 300, damping: 14 }) });
  });
});
