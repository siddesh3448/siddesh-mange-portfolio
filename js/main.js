"use strict";

const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia(
  "(pointer: fine) and (hover: hover) and (min-width: 761px)",
);
const progressBar = document.querySelector(".scroll-progress-bar");
const cosmicCanvas = document.querySelector(".cosmic-canvas");
const cosmicContext = cosmicCanvas?.getContext("2d", { alpha: true });
const navigationLinks = Array.from(
  document.querySelectorAll('.primary-nav a[href^="#"]'),
);
const navigatedSections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter((section) => section instanceof HTMLElement);
const portrait = document.querySelector(".about-portrait");

let progressFrame = 0;
let revealObserver;
let sectionObserver;
let interfacePointerFrame = 0;
let interfacePointerX = 0;
let interfacePointerY = 0;
let cursorLayer;
let cursorDot;
let cursorRing;
let cursorFrame = 0;
let pointerX = 0;
let pointerY = 0;
let ringX = 0;
let ringY = 0;
let pointerActive = false;
let cursorHasPosition = false;
let cosmicWidth = 0;
let cosmicHeight = 0;
let cosmicPixelRatio = 1;
let cosmicStars = [];
let cosmicFrame = 0;
let cosmicResizeFrame = 0;
let lastCosmicFrame = 0;
let cosmicPointerX = -1;
let cosmicPointerY = -1;

function updateScrollProgress() {
  progressFrame = 0;
  if (!progressBar) {
    return;
  }

  const scrollableDistance =
    document.documentElement.scrollHeight - window.innerHeight;
  const progress =
    scrollableDistance > 0
      ? Math.min(1, Math.max(0, window.scrollY / scrollableDistance))
      : 0;

  progressBar.style.setProperty("--scroll-progress", String(progress));
}

function scheduleScrollProgress() {
  if (!progressFrame) {
    progressFrame = window.requestAnimationFrame(updateScrollProgress);
  }
}

function createCosmicStars() {
  const isSmallScreen = window.innerWidth < 680;
  const area = cosmicWidth * cosmicHeight;
  const count = isSmallScreen
    ? Math.max(20, Math.min(38, Math.round(area / 20000)))
    : Math.max(55, Math.min(125, Math.round(area / 14000)));

  cosmicStars = Array.from({ length: count }, () => ({
    x: Math.random() * cosmicWidth,
    y: Math.random() * cosmicHeight,
    startTime: 0,
    radius: 0.85 + Math.random() * 0.95,
    opacity: 0.48 + Math.random() * 0.42,
    phase: Math.random() * Math.PI * 2,
    frequency: 0.25 + Math.random() * 0.45,
    drift: 1 + Math.random() * 3,
    fallSpeed: 7 + Math.random() * 8,
    accent: Math.random() < 0.07,
    interactive: Math.random() < (isSmallScreen ? 0 : 0.16),
    fall: null,
  }));
}

function getCosmicStarPosition(star, time) {
  let x = (star.x + Math.sin(time * star.drift * 0.025 + star.phase) * 2.5) % cosmicWidth;
  let y = (star.y + (time - star.startTime) * star.fallSpeed) % cosmicHeight;

  if (
    finePointer.matches &&
    !reducedMotion.matches &&
    star.interactive &&
    cosmicPointerX >= 0
  ) {
    const deltaX = x - cosmicPointerX;
    const deltaY = y - cosmicPointerY;
    const distanceSquared = deltaX * deltaX + deltaY * deltaY;
    const influenceRadius = 110;

    if (distanceSquared < influenceRadius ** 2) {
      const distance = Math.sqrt(distanceSquared) || 1;
      const influence = (1 - distance / influenceRadius) * 3.5;
      x += (deltaX / distance) * influence;
      y += (deltaY / distance) * influence;
    }
  }

  return { x, y };
}

function drawCosmicGlow(x, y, radius, color, midpointColor) {
  if (!cosmicContext) {
    return;
  }

  const glow = cosmicContext.createRadialGradient(x, y, 0, x, y, radius);
  glow.addColorStop(0, color);
  glow.addColorStop(0.48, midpointColor);
  glow.addColorStop(1, "rgba(16, 16, 16, 0)");
  cosmicContext.fillStyle = glow;
  cosmicContext.fillRect(0, 0, cosmicWidth, cosmicHeight);
}

function drawCosmicScene(time, animate) {
  if (!cosmicContext || cosmicWidth === 0 || cosmicHeight === 0) {
    return;
  }

  cosmicContext.clearRect(0, 0, cosmicWidth, cosmicHeight);
  cosmicContext.save();
  cosmicContext.globalCompositeOperation = "screen";

  const isSmallScreen = window.innerWidth < 680;
  const blueOpacity = isSmallScreen ? "0.045" : "0.065";
  const violetOpacity = isSmallScreen ? "0.035" : "0.05";
  const blueX =
    cosmicWidth * (0.24 + (animate ? Math.sin(time * 0.018) * 0.035 : 0));
  const blueY =
    cosmicHeight * (0.32 + (animate ? Math.cos(time * 0.015) * 0.035 : 0));
  const violetX =
    cosmicWidth * (0.78 + (animate ? Math.cos(time * 0.014) * 0.035 : 0));
  const violetY =
    cosmicHeight * (0.68 + (animate ? Math.sin(time * 0.017) * 0.035 : 0));

  drawCosmicGlow(
    blueX,
    blueY,
    Math.max(cosmicWidth, cosmicHeight) * 0.58,
    `rgba(54, 73, 148, ${blueOpacity})`,
    `rgba(46, 59, 118, ${blueOpacity})`,
  );
  drawCosmicGlow(
    violetX,
    violetY,
    Math.max(cosmicWidth, cosmicHeight) * 0.52,
    `rgba(108, 68, 139, ${violetOpacity})`,
    `rgba(78, 52, 109, ${violetOpacity})`,
  );

  cosmicStars.forEach((star) => {
    let { x, y } = getCosmicStarPosition(star, animate ? time : 0);

    const twinkle = animate
      ? 0.72 + Math.sin(time * star.frequency + star.phase) * 0.22
      : 0.82;
    const opacity = star.opacity * twinkle;

    if (star.fall && animate) {
      const elapsed = time - star.fall.startedAt;
      const fallX = star.fall.x + star.fall.velocityX * elapsed;
      const fallY =
        star.fall.y +
        star.fall.velocityY * elapsed +
        0.5 * star.fall.gravity * elapsed ** 2;
      const directionLength =
        Math.hypot(star.fall.velocityX, star.fall.velocityY) || 1;
      const trailLength = 28;
      const trail = cosmicContext.createLinearGradient(
        fallX - (star.fall.velocityX / directionLength) * trailLength,
        fallY - (star.fall.velocityY / directionLength) * trailLength,
        fallX,
        fallY,
      );
      trail.addColorStop(0, "rgba(244, 242, 237, 0)");
      trail.addColorStop(
        1,
        star.accent ? "rgba(199, 255, 77, 0.85)" : "rgba(244, 242, 237, 0.85)",
      );

      cosmicContext.globalAlpha = Math.max(0, 1 - elapsed / 4);
      cosmicContext.strokeStyle = trail;
      cosmicContext.lineWidth = 1.4;
      cosmicContext.lineCap = "round";
      cosmicContext.beginPath();
      cosmicContext.moveTo(
        fallX - (star.fall.velocityX / directionLength) * trailLength,
        fallY - (star.fall.velocityY / directionLength) * trailLength,
      );
      cosmicContext.lineTo(fallX, fallY);
      cosmicContext.stroke();
      cosmicContext.fillStyle = star.accent ? "#c7ff4d" : "#f4f2ed";
      cosmicContext.beginPath();
      cosmicContext.arc(fallX, fallY, star.radius + 0.8, 0, Math.PI * 2);
      cosmicContext.fill();

      if (fallY > cosmicHeight + trailLength || elapsed > 5) {
        star.x = (fallX % cosmicWidth + cosmicWidth) % cosmicWidth;
        star.y = Math.random() * cosmicHeight * 0.2;
        star.startTime = time;
        star.fall = null;
      }
      return;
    }

    cosmicContext.globalAlpha = opacity;
    cosmicContext.fillStyle = star.accent ? "#c7ff4d" : "#f4f2ed";
    cosmicContext.beginPath();
    cosmicContext.arc(x, y, star.radius, 0, Math.PI * 2);
    cosmicContext.fill();
  });

  cosmicContext.restore();
}

function resizeCosmicCanvas() {
  cosmicResizeFrame = 0;
  if (!cosmicCanvas || !cosmicContext) {
    return;
  }

  cosmicWidth = window.innerWidth;
  cosmicHeight = window.innerHeight;
  cosmicPixelRatio = Math.min(
    window.devicePixelRatio || 1,
    window.innerWidth < 680 ? 1.25 : 1.5,
  );

  cosmicCanvas.width = Math.max(1, Math.round(cosmicWidth * cosmicPixelRatio));
  cosmicCanvas.height = Math.max(1, Math.round(cosmicHeight * cosmicPixelRatio));
  cosmicContext.setTransform(cosmicPixelRatio, 0, 0, cosmicPixelRatio, 0, 0);
  createCosmicStars();
  drawCosmicScene(lastCosmicFrame / 1000, !reducedMotion.matches && !document.hidden);
}

function scheduleCosmicResize() {
  if (!cosmicResizeFrame) {
    cosmicResizeFrame = window.requestAnimationFrame(resizeCosmicCanvas);
  }
}

function animateCosmicScene(timestamp) {
  cosmicFrame = 0;
  if (document.hidden || reducedMotion.matches || !cosmicContext) {
    return;
  }

  const isSmallScreen = window.innerWidth < 680;
  const frameInterval = isSmallScreen ? 1000 / 24 : 1000 / 30;
  if (timestamp - lastCosmicFrame >= frameInterval) {
    lastCosmicFrame = timestamp;
    drawCosmicScene(timestamp / 1000, true);
  }

  cosmicFrame = window.requestAnimationFrame(animateCosmicScene);
}

function stopCosmicAnimation() {
  if (cosmicFrame) {
    window.cancelAnimationFrame(cosmicFrame);
    cosmicFrame = 0;
  }
}

function startCosmicAnimation() {
  if (!cosmicCanvas || !cosmicContext) {
    return;
  }

  if (cosmicCanvas.width === 0 || cosmicCanvas.height === 0) {
    resizeCosmicCanvas();
  }

  stopCosmicAnimation();
  if (document.hidden || reducedMotion.matches) {
    drawCosmicScene(0, false);
    return;
  }

  lastCosmicFrame = 0;
  cosmicFrame = window.requestAnimationFrame(animateCosmicScene);
}

function handleCosmicPointerMove(event) {
  if (
    !finePointer.matches ||
    reducedMotion.matches ||
    event.pointerType !== "mouse"
  ) {
    return;
  }

  cosmicPointerX = event.clientX;
  cosmicPointerY = event.clientY;
}

function clearCosmicPointer() {
  cosmicPointerX = -1;
  cosmicPointerY = -1;
}

function handleCosmicClick(event) {
  if (
    !finePointer.matches ||
    reducedMotion.matches ||
    event.detail === 0 ||
    !(event.target instanceof Element) ||
    event.target.closest("a, button, input, select, textarea, [role='button']")
  ) {
    return;
  }

  const time = lastCosmicFrame / 1000;
  let closestStar;
  let closestDistance = 18 ** 2;

  cosmicStars.forEach((star) => {
    if (star.fall) {
      return;
    }

    const position = getCosmicStarPosition(star, time);
    const deltaX = position.x - event.clientX;
    const deltaY = position.y - event.clientY;
    const distance = deltaX * deltaX + deltaY * deltaY;

    if (distance < closestDistance) {
      closestDistance = distance;
      closestStar = { star, position };
    }
  });

  if (!closestStar) {
    return;
  }

  closestStar.star.fall = {
    x: closestStar.position.x,
    y: closestStar.position.y,
    startedAt: performance.now() / 1000,
    velocityX: 20 + Math.random() * 30,
    velocityY: 95 + Math.random() * 45,
    gravity: 28,
  };
}

function handleCosmicVisibilityChange() {
  if (document.hidden) {
    stopCosmicAnimation();
    clearCosmicPointer();
    return;
  }

  startCosmicAnimation();
}

function handleCosmicMotionChange() {
  if (reducedMotion.matches) {
    stopCosmicAnimation();
    clearCosmicPointer();
    drawCosmicScene(0, false);
    return;
  }

  startCosmicAnimation();
}

function updateActiveSection() {
  const activeSection = Array.from(sectionObserver?.visibleSections ?? [])
    .map((section) => ({
      section,
      distance: Math.abs(section.getBoundingClientRect().top - window.innerHeight * 0.35),
    }))
    .sort((first, second) => first.distance - second.distance)[0]?.section;

  navigationLinks.forEach((link) => {
    if (activeSection && link.hash === `#${activeSection.id}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function initializeSectionObserver() {
  if (!("IntersectionObserver" in window) || navigatedSections.length === 0) {
    return;
  }

  sectionObserver?.observer.disconnect();
  const visibleSections = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.add(entry.target);
        } else {
          visibleSections.delete(entry.target);
        }
      });

      updateActiveSection();
    },
    {
      rootMargin: "-18% 0px -62% 0px",
      threshold: 0,
    },
  );

  navigatedSections.forEach((section) => observer.observe(section));
  sectionObserver = { observer, visibleSections };
}

function initializeRevealObserver() {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const revealTargets = document.querySelectorAll(
    ".section-heading, .work-heading, .about-heading, .project, .experience-entry, .skill-group, .education-record, .programs, .contact-intro, .contact-details",
  );
  revealTargets.forEach((target, index) => {
    target.setAttribute("data-reveal", "");
    if (target.matches(".project, .experience-entry, .skill-group, .education-record")) {
      target.style.setProperty("--reveal-delay", `${(index % 4) * 55}ms`);
    }
  });

  revealObserver?.disconnect();
  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.12,
    },
  );

  revealTargets.forEach((target) => {
    if (!target.classList.contains("is-revealed")) {
      revealObserver.observe(target);
    }
  });
}

function clearInterfacePointerEffects() {
  if (interfacePointerFrame) {
    window.cancelAnimationFrame(interfacePointerFrame);
    interfacePointerFrame = 0;
  }

  portrait?.classList.remove("is-near-pointer");
  portrait?.style.removeProperty("--portrait-tilt-x");
  portrait?.style.removeProperty("--portrait-tilt-y");
}

function updateInterfacePointerEffects() {
  interfacePointerFrame = 0;
  if (!finePointer.matches || reducedMotion.matches) {
    clearInterfacePointerEffects();
    return;
  }

  if (!portrait) {
    return;
  }

  const bounds = portrait.getBoundingClientRect();
  const closestX = Math.min(Math.max(interfacePointerX, bounds.left), bounds.right);
  const closestY = Math.min(Math.max(interfacePointerY, bounds.top), bounds.bottom);
  const distanceToPortrait = Math.hypot(
    interfacePointerX - closestX,
    interfacePointerY - closestY,
  );

  if (distanceToPortrait > 72) {
    portrait.classList.remove("is-near-pointer");
    portrait.style.removeProperty("--portrait-tilt-x");
    portrait.style.removeProperty("--portrait-tilt-y");
    return;
  }

  const normalizedX = Math.max(
    -1,
    Math.min(1, (interfacePointerX - (bounds.left + bounds.width / 2)) / (bounds.width / 2)),
  );
  const normalizedY = Math.max(
    -1,
    Math.min(1, (interfacePointerY - (bounds.top + bounds.height / 2)) / (bounds.height / 2)),
  );
  const portraitTilt = window.innerWidth > 1000 ? 3 : 0;
  portrait.classList.add("is-near-pointer");
  portrait.style.setProperty("--portrait-tilt-x", `${-normalizedY * portraitTilt}deg`);
  portrait.style.setProperty("--portrait-tilt-y", `${normalizedX * portraitTilt}deg`);
}

function handleInterfacePointerMove(event) {
  if (
    !finePointer.matches ||
    reducedMotion.matches ||
    event.pointerType !== "mouse"
  ) {
    return;
  }

  interfacePointerX = event.clientX;
  interfacePointerY = event.clientY;
  if (!interfacePointerFrame) {
    interfacePointerFrame = window.requestAnimationFrame(
      updateInterfacePointerEffects,
    );
  }
}

function moveCursor() {
  cursorFrame = 0;
  if (!cursorLayer || !cursorDot || !cursorRing || !pointerActive) {
    return;
  }

  ringX += (pointerX - ringX) * 0.22;
  ringY += (pointerY - ringY) * 0.22;
  cursorDot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
  cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

  if (Math.abs(pointerX - ringX) > 0.1 || Math.abs(pointerY - ringY) > 0.1) {
    cursorFrame = window.requestAnimationFrame(moveCursor);
  } else {
    ringX = pointerX;
    ringY = pointerY;
  }
}

function hideCursor() {
  pointerActive = false;
  cursorHasPosition = false;
  cursorLayer?.classList.remove("is-visible", "is-interactive", "is-pressed");
  root.classList.remove("custom-cursor-active");
  if (cursorFrame) {
    window.cancelAnimationFrame(cursorFrame);
    cursorFrame = 0;
  }
}

function handlePointerMove(event) {
  if (!finePointer.matches || reducedMotion.matches) {
    destroyCursor();
    return;
  }

  if (event.pointerType !== "mouse" || !cursorLayer) {
    return;
  }

  pointerX = event.clientX;
  pointerY = event.clientY;
  if (!cursorHasPosition) {
    ringX = pointerX;
    ringY = pointerY;
    cursorHasPosition = true;
  }
  pointerActive = true;
  cursorLayer.classList.add("is-visible");
  root.classList.add("custom-cursor-active");
  cursorLayer.classList.toggle(
    "is-interactive",
    event.target instanceof Element &&
      Boolean(event.target.closest("a, button, .project, [role='button']")),
  );

  if (!cursorFrame) {
    cursorFrame = window.requestAnimationFrame(moveCursor);
  }
}

function initializeCursor() {
  if (cursorLayer || !finePointer.matches || reducedMotion.matches) {
    return;
  }

  const layer = document.createElement("div");
  layer.className = "custom-cursor";
  layer.setAttribute("aria-hidden", "true");

  const dot = document.createElement("span");
  dot.className = "custom-cursor-dot";
  const ring = document.createElement("span");
  ring.className = "custom-cursor-ring";
  layer.append(dot, ring);
  document.body.append(layer);

  cursorLayer = layer;
  cursorDot = dot;
  cursorRing = ring;
  document.addEventListener("pointermove", handlePointerMove);
  document.addEventListener("pointerleave", hideCursor);
  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("blur", hideCursor);
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

function handlePointerDown() {
  cursorLayer?.classList.add("is-pressed");
}

function handlePointerUp() {
  cursorLayer?.classList.remove("is-pressed");
}

function handleVisibilityChange() {
  if (document.hidden) {
    hideCursor();
  }
}

function destroyCursor() {
  hideCursor();
  document.removeEventListener("pointermove", handlePointerMove);
  document.removeEventListener("pointerleave", hideCursor);
  document.removeEventListener("pointerdown", handlePointerDown);
  document.removeEventListener("pointerup", handlePointerUp);
  window.removeEventListener("blur", hideCursor);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  root.classList.remove("custom-cursor-active");
  cursorLayer?.remove();
  cursorLayer = null;
  cursorDot = null;
  cursorRing = null;
}

function handleMotionPreferenceChange() {
  if (reducedMotion.matches) {
    root.classList.remove("motion-ready");
    revealObserver?.disconnect();
    destroyCursor();
    clearInterfacePointerEffects();
    return;
  }

  initializeRevealObserver();
  initializeCursor();
  root.classList.add("motion-ready");
}

function handlePointerCapabilityChange() {
  if (finePointer.matches && !reducedMotion.matches) {
    initializeCursor();
  } else {
    destroyCursor();
    clearInterfacePointerEffects();
  }
}

function loadCompanions3D() {
  import("./companions-3d.js")
    .then(({ initializeCompanions3D }) => initializeCompanions3D(reducedMotion))
    .catch((error) => {
      const field = document.querySelector(".companion-field");
      if (field) {
        const status = document.createElement("p");
        status.className = "visually-hidden companion-status";
        status.setAttribute("role", "status");
        status.textContent = "3D companions could not be loaded.";
        field.append(status);
      }
      console.error("Could not load the local 3D companion module.", error);
    });
}

window.addEventListener("scroll", scheduleScrollProgress, { passive: true });
window.addEventListener("pointermove", handleInterfacePointerMove, {
  passive: true,
});
window.addEventListener(
  "resize",
  () => {
    scheduleScrollProgress();
    handlePointerCapabilityChange();
  },
  { passive: true },
);
updateScrollProgress();
initializeSectionObserver();
loadCompanions3D();

if (!reducedMotion.matches) {
  initializeRevealObserver();
  initializeCursor();
  root.classList.add("motion-ready");
}

reducedMotion.addEventListener("change", handleMotionPreferenceChange);
finePointer.addEventListener("change", handlePointerCapabilityChange);

if (cosmicCanvas && cosmicContext) {
  resizeCosmicCanvas();
  startCosmicAnimation();
  window.addEventListener("resize", scheduleCosmicResize, { passive: true });
  window.addEventListener("pointermove", handleCosmicPointerMove, {
    passive: true,
  });
  window.addEventListener("click", handleCosmicClick);
  window.addEventListener("pointerleave", clearCosmicPointer);
  window.addEventListener("blur", clearCosmicPointer);
  document.addEventListener("visibilitychange", handleCosmicVisibilityChange);
  window.addEventListener("pagehide", stopCosmicAnimation);
  window.addEventListener("pageshow", handleCosmicVisibilityChange);
  reducedMotion.addEventListener("change", handleCosmicMotionChange);
  finePointer.addEventListener("change", clearCosmicPointer);
}
