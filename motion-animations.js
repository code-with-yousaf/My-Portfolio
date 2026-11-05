/**
 * Motion.dev (https://motion.dev) animations for MYK Portfolio
 * Uses Motion for JavaScript (vanilla) — animate(), scroll(), stagger(), spring()
 */

import {
  animate,
  scroll,
  stagger,
  spring,
  inView
} from "https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm";

/* ─────────────────────────────────────────
   1. HERO TITLE — spring slide-in
───────────────────────────────────────── */
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
animate(
  ".hero-badge",
  { opacity: [0, 1], scale: [0.6, 1.05, 1], y: [-10, 0] },
  { duration: 0.7, delay: 0.05, easing: spring({ stiffness: 200, damping: 18 }) }
);

/* ─────────────────────────────────────────
   3. HERO SUBTITLE + LOCATION + DESC + CTA
      — staggered fade-up
───────────────────────────────────────── */
animate(
  [".hero-subtitle", ".hero-location", ".hero-desc", ".hero-cta", ".hero-stats"],
  { opacity: [0, 1], y: [24, 0] },
  { duration: 0.65, delay: stagger(0.12, { start: 0.32 }), easing: [0.22, 1, 0.36, 1] }
);

/* ─────────────────────────────────────────
   4. HERO VISUAL — spring scale-in from right
───────────────────────────────────────── */
animate(
  ".hero-visual",
  { opacity: [0, 1], scale: [0.78, 1], x: [40, 0] },
  { duration: 1, delay: 0.4, easing: spring({ stiffness: 80, damping: 14 }) }
);

/* ─────────────────────────────────────────
   5. FLOATING CARDS — spring pop
───────────────────────────────────────── */
const floatCards = document.querySelectorAll(".float-card");
floatCards.forEach((card, i) => {
  animate(
    card,
    { opacity: [0, 1], scale: [0.5, 1.08, 1], y: [20, 0] },
    { duration: 0.6, delay: 0.8 + i * 0.18, easing: spring({ stiffness: 180, damping: 16 }) }
  );
});

/* ─────────────────────────────────────────
   6. NAVBAR — scroll-triggered backdrop
   (enhances existing JS — adds Motion blur)
───────────────────────────────────────── */
// Motion scroll progress on body to subtly scale logo
scroll(
  animate(".nav-brand", { scale: [1, 0.9], opacity: [1, 0.8] }, { easing: "ease-in" }),
  { target: document.documentElement, offset: ["0px", "300px"] }
);

/* ─────────────────────────────────────────
   7. SECTION HEADERS — spring bounce inView
───────────────────────────────────────── */
document.querySelectorAll(".section-header").forEach(header => {
  // reset existing CSS reveal so Motion takes over
  header.style.opacity = "0";
  header.style.transform = "translateY(32px)";

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
const skillCards = document.querySelectorAll(".skill-card");
skillCards.forEach(card => {
  card.style.opacity = "0";
  card.style.transform = "translateY(40px) scale(0.95)";
});

inView(".skills-grid", () => {
  animate(
    ".skill-card",
    { opacity: [0, 1], y: [40, 0], scale: [0.92, 1] },
    {
      duration: 0.6,
      delay: stagger(0.1),
      easing: spring({ stiffness: 120, damping: 15 })
    }
  );
}, { margin: "-60px" });

/* ─────────────────────────────────────────
   9. PROJECT CARDS — stagger slide-up
───────────────────────────────────────── */
const projCards = document.querySelectorAll(".project-card");
projCards.forEach(card => {
  card.style.opacity = "0";
  card.style.transform = "translateY(50px)";
});

inView(".projects-grid", () => {
  animate(
    ".project-card",
    { opacity: [0, 1], y: [50, 0] },
    {
      duration: 0.65,
      delay: stagger(0.13),
      easing: [0.22, 1, 0.36, 1]
    }
  );
}, { margin: "-60px" });

/* ─────────────────────────────────────────
   10. ABOUT SECTION — split grid reveal
───────────────────────────────────────── */
const aboutText = document.querySelector(".about-text");
const aboutVisual = document.querySelector(".about-visual");

if (aboutText && aboutVisual) {
  [aboutText, aboutVisual].forEach(el => {
    el.style.opacity = "0";
  });
  aboutText.style.transform = "translateX(-40px)";
  aboutVisual.style.transform = "translateX(40px)";

  inView(".about-grid", () => {
    animate(
      aboutText,
      { opacity: [0, 1], x: [-40, 0] },
      { duration: 0.8, easing: spring({ stiffness: 80, damping: 16 }) }
    );
    animate(
      aboutVisual,
      { opacity: [0, 1], x: [40, 0] },
      { duration: 0.8, delay: 0.15, easing: spring({ stiffness: 80, damping: 16 }) }
    );
  }, { margin: "-60px" });
}

/* ─────────────────────────────────────────
   11. CONTACT SECTION — stagger items
───────────────────────────────────────── */
const contactInfo = document.querySelector(".contact-info");
const contactForm = document.querySelector(".contact-form");

if (contactInfo && contactForm) {
  contactInfo.style.opacity = "0";
  contactInfo.style.transform = "translateY(30px)";
  contactForm.style.opacity = "0";
  contactForm.style.transform = "translateY(30px)";

  inView(".contact-grid", () => {
    animate(
      contactInfo,
      { opacity: [0, 1], y: [30, 0] },
      { duration: 0.7, easing: spring({ stiffness: 100, damping: 16 }) }
    );
    animate(
      contactForm,
      { opacity: [0, 1], y: [30, 0] },
      { duration: 0.7, delay: 0.18, easing: spring({ stiffness: 100, damping: 16 }) }
    );
  }, { margin: "-60px" });
}

/* ─────────────────────────────────────────
   12. HIGHLIGHT ITEMS (About) — stagger
───────────────────────────────────────── */
const highlightItems = document.querySelectorAll(".highlight-item");
highlightItems.forEach(item => {
  item.style.opacity = "0";
  item.style.transform = "translateX(-20px)";
});

inView(".about-highlights", () => {
  animate(
    ".highlight-item",
    { opacity: [0, 1], x: [-20, 0] },
    {
      duration: 0.5,
      delay: stagger(0.12, { start: 0.1 }),
      easing: spring({ stiffness: 150, damping: 18 })
    }
  );
}, { margin: "-40px" });

/* ─────────────────────────────────────────
   13. SCROLL PARALLAX — hero background glow
───────────────────────────────────────── */
const heroSection = document.querySelector(".hero");
if (heroSection) {
  scroll(
    animate(heroSection, { backgroundPositionY: ["0%", "30%"] }, { easing: "linear" }),
    { target: heroSection, offset: ["start start", "end start"] }
  );
}

/* ─────────────────────────────────────────
   14. PROJECT CARD HOVER — Motion spring tilt
───────────────────────────────────────── */
document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("mouseenter", () => {
    animate(card, { scale: 1.025, rotateX: 2, rotateY: -2 }, {
      duration: 0.35,
      easing: spring({ stiffness: 200, damping: 20 })
    });
  });
  card.addEventListener("mouseleave", () => {
    animate(card, { scale: 1, rotateX: 0, rotateY: 0 }, {
      duration: 0.4,
      easing: spring({ stiffness: 160, damping: 22 })
    });
  });
});

/* ─────────────────────────────────────────
   15. SKILL CARD HOVER — icon bounce
───────────────────────────────────────── */
document.querySelectorAll(".skill-card").forEach(card => {
  const icon = card.querySelector(".skill-icon");
  if (!icon) return;
  card.addEventListener("mouseenter", () => {
    animate(icon, { scale: [1, 1.35, 1.2], rotate: [0, -8, 0] }, {
      duration: 0.5,
      easing: spring({ stiffness: 300, damping: 14 })
    });
  });
});

/* ─────────────────────────────────────────
   16. FOOTER — fade-in from bottom
───────────────────────────────────────── */
const footer = document.querySelector(".footer");
if (footer) {
  footer.style.opacity = "0";
  inView(footer, () => {
    animate(footer, { opacity: [0, 1], y: [20, 0] }, {
      duration: 0.6,
      easing: [0.22, 1, 0.36, 1]
    });
  }, { margin: "-20px" });
}
