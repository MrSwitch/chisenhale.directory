/**
 * Sponsor page swipe navigation.
 *
 * Each sponsor page renders its swappable regions (header, menu, main, aside)
 * nested inside `.swipeTrack > .swipePanel`. During a horizontal gesture the
 * neighbouring page is fetched and its panel content is placed into a second,
 * fixed-position panel in the same document. Both panels then track the finger
 * 1:1. On commit the underlying panel adopts the new content beneath the
 * overlay and the overlay is removed with no visible seam; on cancel both
 * panels settle back with momentum inherited from the gesture.
 */

const DRAG_START_PX = 10;
const TRIGGER_RATIO = 0.26;
const VELOCITY_THRESHOLD = 0.5; // px per ms
const EDGE_RESISTANCE = 0.55;

const docCache = new Map();

const body = document.body;
const track = document.querySelector(".swipeTrack");
const currentPanel = track?.querySelector(":scope > .swipePanel") ?? null;
const enabled = body?.dataset.sponsorSwipe === "true" && !!track && !!currentPanel;

const state = { prevUrl: null, nextUrl: null };

let incomingPanel = null;
let incomingDirection = 0;
let incomingUrl = null;

let pointerId = null;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastT = 0;
let velocityX = 0;
let offsetX = 0;
let dragging = false;
let navigating = false;
let rafId = 0;
let pendingOffset = 0;

if (enabled) {
  initialize();
}

function initialize() {
  refreshNavigationState();
  preloadNeighbors();

  document.addEventListener("pointerdown", onPointerDown, { passive: true });
  document.addEventListener("pointermove", onPointerMove, { passive: false });
  document.addEventListener("pointerup", onPointerUp, { passive: true });
  document.addEventListener("pointercancel", onPointerCancel, { passive: true });
  document.addEventListener("click", onLinkClick);
  window.addEventListener("popstate", onPopState);
}

/* ------------------------------------------------------------------ *
 * Gesture tracking
 * ------------------------------------------------------------------ */

function onPointerDown(event) {
  if (navigating || !event.isPrimary) {
    return;
  }

  // Touch and pen always drag; mouse drags with the primary button only.
  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }

  if (event.target.closest("a, button, input, textarea, select, summary, [contenteditable='true']")) {
    return;
  }

  pointerId = event.pointerId;
  startX = event.clientX;
  startY = event.clientY;
  lastX = event.clientX;
  lastT = event.timeStamp;
  velocityX = 0;
  offsetX = 0;
  dragging = false;
}

function onPointerMove(event) {
  if (event.pointerId !== pointerId || navigating) {
    return;
  }

  const rawDx = event.clientX - startX;
  const rawDy = event.clientY - startY;

  if (!dragging) {
    if (Math.max(Math.abs(rawDx), Math.abs(rawDy)) < DRAG_START_PX) {
      return;
    }

    // Axis lock: if the gesture starts vertically, hand it to native scrolling.
    if (Math.abs(rawDy) > Math.abs(rawDx)) {
      pointerId = null;
      return;
    }

    dragging = true;
    body.classList.add("isSwipeDragging");
  }

  const dt = Math.max(1, event.timeStamp - lastT);
  velocityX = (event.clientX - lastX) / dt;
  lastX = event.clientX;
  lastT = event.timeStamp;

  offsetX = applyEdgeResistance(rawDx);

  // Build (or rebuild) the incoming panel to match the drag direction.
  const direction = offsetX < 0 ? 1 : -1;
  const targetUrl = direction === 1 ? state.nextUrl : state.prevUrl;
  ensureIncomingPanel(direction, targetUrl);

  scheduleRender(offsetX);

  if (event.cancelable) {
    event.preventDefault();
  }
}

function scheduleRender(offset) {
  pendingOffset = offset;
  if (rafId) {
    return;
  }

  rafId = requestAnimationFrame(() => {
    rafId = 0;
    setPanelTransform(currentPanel, pendingOffset);
    if (incomingPanel) {
      setPanelTransform(incomingPanel, incomingRestOffset() + pendingOffset);
    }
  });
}

async function onPointerUp(event) {
  if (event.pointerId !== pointerId) {
    return;
  }
  await releaseGesture();
}

async function onPointerCancel(event) {
  if (event.pointerId !== pointerId) {
    return;
  }
  await releaseGesture(true);
}

async function releaseGesture(forceCancel = false) {
  pointerId = null;

  // Drop any queued frame so it can't overwrite the settle animation.
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  if (!dragging || forceCancel) {
    dragging = false;
    await settleBack();
    return;
  }

  const width = Math.max(window.innerWidth, 1);
  const travel = Math.abs(offsetX);
  const direction = offsetX < 0 ? 1 : -1;
  const targetUrl = direction === 1 ? state.nextUrl : state.prevUrl;

  // Momentum must agree with the drag direction: a backwards flick cancels.
  const isFlick = Math.abs(velocityX) > VELOCITY_THRESHOLD;
  const flickForward = isFlick && (direction === 1 ? velocityX < 0 : velocityX > 0);
  const flickBackward = isFlick && !flickForward;
  const shouldNavigate =
    !!targetUrl &&
    !flickBackward &&
    (travel > width * TRIGGER_RATIO || (travel > width * 0.12 && flickForward));

  dragging = false;

  if (!targetUrl) {
    await bounceEdge();
    return;
  }

  if (shouldNavigate) {
    await navigateTo(targetUrl, direction, true);
    return;
  }

  await settleBack();
}

/* ------------------------------------------------------------------ *
 * Motion helpers
 *
 * Transforms are applied inline (element.style), NOT via CSS custom
 * properties: the build pipeline (postcss-css-variables) compiles var()
 * usage to static values, so runtime variable updates have no effect.
 * ------------------------------------------------------------------ */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_SPRING = "cubic-bezier(0.18, 0.89, 0.32, 1.28)";

function applyEdgeResistance(deltaX) {
  const width = Math.max(window.innerWidth, 1);

  if (deltaX > 0 && !state.prevUrl) {
    return rubberBand(deltaX, width);
  }

  if (deltaX < 0 && !state.nextUrl) {
    return -rubberBand(Math.abs(deltaX), width);
  }

  return deltaX;
}

function rubberBand(distance, dimension) {
  return (distance * EDGE_RESISTANCE * dimension) / (dimension + EDGE_RESISTANCE * distance);
}

function setPanelTransform(panel, px, transition = "none") {
  if (!panel) {
    return;
  }
  panel.style.transition = transition;
  panel.style.transform = `translate3d(${px}px, 0, 0)`;
}

function incomingRestOffset() {
  const width = Math.max(window.innerWidth, 1);
  return incomingDirection === 1 ? width : -width;
}

function settleDuration(remainingPx, velocity) {
  // Inherit gesture momentum: fast flicks settle quickly, slow releases glide.
  const speed = Math.max(Math.abs(velocity), 0.6); // px per ms
  return Math.round(Math.min(360, Math.max(140, remainingPx / speed)));
}

async function animatePanels(currentTarget, incomingTarget, duration, easing = EASE) {
  // Force a reflow so freshly written (or freshly inserted) start positions
  // are committed, giving the transition a rendered state to animate from.
  void track.offsetWidth;
  const transition = `transform ${duration}ms ${easing}`;
  setPanelTransform(currentPanel, currentTarget, transition);
  if (incomingPanel) {
    setPanelTransform(incomingPanel, incomingTarget, transition);
  }
  await wait(duration + 20);
}

async function settleBack() {
  body.classList.remove("isSwipeDragging");
  const duration = settleDuration(Math.abs(offsetX), velocityX);
  await animatePanels(0, incomingRestOffset(), duration);
  clearIncomingPanel();
  setPanelTransform(currentPanel, 0); // clear lingering transition
  offsetX = 0;
}

async function bounceEdge() {
  body.classList.remove("isSwipeDragging");
  clearIncomingPanel();

  // Spring back from wherever the finger left the panel, overshooting
  // slightly past rest like a native scroll edge.
  const duration = Math.max(settleDuration(Math.abs(offsetX), velocityX), 320);
  await animatePanels(0, 0, duration, EASE_SPRING);
  setPanelTransform(currentPanel, 0);
  offsetX = 0;
}

/* ------------------------------------------------------------------ *
 * Incoming panel lifecycle
 * ------------------------------------------------------------------ */

function ensureIncomingPanel(direction, url) {
  if (!url) {
    clearIncomingPanel();
    return;
  }

  if (incomingPanel && incomingDirection === direction && incomingUrl === url) {
    return;
  }

  const cached = docCache.get(url);
  if (!cached || cached.pending) {
    preloadDocument(url);
    return; // Panel will be built on a later move event once the fetch lands.
  }

  const sourcePanel = cached.doc?.querySelector(".swipeTrack > .swipePanel");
  if (!sourcePanel) {
    clearIncomingPanel();
    return;
  }

  clearIncomingPanel();
  incomingDirection = direction;
  incomingUrl = url;
  incomingPanel = document.createElement("div");
  incomingPanel.className = `swipePanel isIncoming ${direction === 1 ? "fromNext" : "fromPrev"}`;
  incomingPanel.setAttribute("aria-hidden", "true");
  incomingPanel.setAttribute("inert", "");
  incomingPanel.innerHTML = sourcePanel.innerHTML;

  // Off-screen fixed elements defeat lazy loading; force images to fetch now.
  for (const img of incomingPanel.querySelectorAll("img[loading='lazy']")) {
    img.loading = "eager";
  }

  // The nav is page chrome and stays put: when it is visible (page at top)
  // the overlay starts below it. When scrolled past the nav, the overlay
  // covers the viewport and carries a nav clone so its content matches the
  // adopted page exactly once scroll resets to the top.
  const nav = document.querySelector("body > nav");
  const navHeight = nav ? nav.offsetHeight : 0;
  if (window.scrollY >= 1 || !nav) {
    incomingPanel.style.top = "0px";
    if (nav) {
      const navClone = nav.cloneNode(true);
      navClone.setAttribute("inert", "");
      incomingPanel.prepend(navClone);
    }
  } else {
    incomingPanel.style.top = `${navHeight}px`;
  }

  // Position off-screen before insertion so the panel never paints mid-view.
  setPanelTransform(incomingPanel, direction * Math.max(window.innerWidth, 1));
  track.append(incomingPanel);
}

function clearIncomingPanel() {
  incomingPanel?.remove();
  incomingPanel = null;
  incomingDirection = 0;
  incomingUrl = null;
}

/* ------------------------------------------------------------------ *
 * Navigation and adoption
 * ------------------------------------------------------------------ */

function onLinkClick(event) {
  const link = event.target.closest("a[data-swipe-nav]");
  if (!link || navigating) {
    return;
  }

  const href = link.getAttribute("href");
  if (!href) {
    return;
  }

  event.preventDefault();
  const direction = link.dataset.swipeNav === "next" ? 1 : -1;
  navigateTo(new URL(href, location.origin).pathname, direction, true);
}

async function onPopState() {
  if (navigating) {
    return;
  }

  const target = location.pathname;
  if (!target.startsWith("/sponsors/")) {
    window.location.assign(location.href);
    return;
  }

  // Slide from the matching side when the destination is a known neighbour.
  const direction = target === state.nextUrl ? 1 : target === state.prevUrl ? -1 : 0;
  await navigateTo(target, direction, false);
}

async function navigateTo(url, direction, pushState) {
  if (!url || navigating || url === location.pathname) {
    return;
  }

  navigating = true;
  body.classList.remove("isSwipeDragging");

  const doc = await preloadDocument(url);
  if (!doc) {
    navigating = false;
    await settleBack();
    return;
  }

  if (!isSponsorDocument(doc)) {
    navigating = false;
    window.location.assign(url);
    return;
  }

  if (direction !== 0) {
    ensureIncomingPanel(direction, url);
  }

  if (direction !== 0 && incomingPanel && incomingDirection === direction) {
    // Finish the physical motion the user started (or start it, for a link
    // click), inheriting the gesture's velocity for the remaining distance.
    const width = window.innerWidth;
    const duration = settleDuration(Math.max(width - Math.abs(offsetX), 0), velocityX);
    await animatePanels(direction === 1 ? -width : width, 0, duration);

    // The overlay now covers the viewport. Swap the underlying panel's content
    // and reset its transform with no transition, then remove the overlay:
    // the same pixels remain on screen throughout.
    adoptDocument(doc);
    setPanelTransform(currentPanel, 0);
    void body.offsetWidth; // commit the reset before the overlay disappears
    clearIncomingPanel();
  } else if (typeof document.startViewTransition === "function") {
    // Non-directional adoption (e.g. deep history jumps): soft crossfade.
    const viewTransition = document.startViewTransition(() => adoptDocument(doc));
    await viewTransition.finished;
  } else {
    adoptDocument(doc);
  }

  if (pushState && location.pathname !== url) {
    history.pushState({ sponsorSwipe: true }, "", url);
  }

  offsetX = 0;
  velocityX = 0;
  refreshNavigationState();
  preloadNeighbors();
  navigating = false;
}

function adoptDocument(doc) {
  const sourcePanel = doc.querySelector(".swipeTrack > .swipePanel");
  if (!sourcePanel) {
    window.location.assign(location.pathname);
    return;
  }

  window.scrollTo(0, 0);
  currentPanel.innerHTML = sourcePanel.innerHTML;
  document.title = doc.title;
  copyHeadMeta(doc);
}

function copyHeadMeta(doc) {
  const selectors = [
    "meta[name='description']",
    "meta[property='og:url']",
    "meta[property='og:title']",
    "meta[property='og:description']",
    "meta[property='og:image']",
  ];

  for (const selector of selectors) {
    const current = document.head.querySelector(selector);
    const next = doc.head.querySelector(selector);
    if (current && next) {
      current.replaceWith(next.cloneNode(true));
    }
  }
}

/* ------------------------------------------------------------------ *
 * Prefetching
 * ------------------------------------------------------------------ */

function refreshNavigationState() {
  state.prevUrl = normalizeUrl(document.querySelector("a[data-swipe-nav='prev']")?.getAttribute("href"));
  state.nextUrl = normalizeUrl(document.querySelector("a[data-swipe-nav='next']")?.getAttribute("href"));
}

function normalizeUrl(href) {
  return href ? new URL(href, location.origin).pathname : null;
}

function preloadNeighbors() {
  preloadDocument(state.prevUrl);
  preloadDocument(state.nextUrl);
}

function preloadDocument(url) {
  if (!url) {
    return Promise.resolve(null);
  }

  const cached = docCache.get(url);
  if (cached) {
    return cached.promise;
  }

  const entry = { pending: true, doc: null, promise: null };
  entry.promise = fetch(url, { credentials: "same-origin" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to preload ${url}: ${response.status}`);
      }
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      entry.doc = doc;
      entry.pending = false;
      return doc;
    })
    .catch(() => {
      docCache.delete(url); // allow retry on a future attempt
      return null;
    });

  docCache.set(url, entry);
  return entry.promise;
}

function isSponsorDocument(doc) {
  return doc?.body?.dataset?.sponsorSwipe === "true";
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
