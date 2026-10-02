// Reveals text that was obfuscated at build time (see the "obfuscate" shortcode
// in eleventy.config.js). Crawlers that don't execute JS never see the content.
customElements.define(
  "obfuscated-text",
  class extends HTMLElement {
    connectedCallback() {
      const data = this.getAttribute("data");
      if (data) {
        this.textContent = [...atob(data)].reverse().join("");
      }
    }
  }
);

// Fade the hero image in once it has loaded, instead of letting it pop in
// abruptly. If it's already cached (complete) it stays fully visible.
{
  const hero = document.getElementById("heroImage");
  if (hero && !hero.complete) {
    hero.classList.add("isLoading");
    hero.addEventListener("load", () => hero.classList.remove("isLoading"), {
      once: true,
    });
  }
}

// Sponsor cards (homepage) and the sponsor list (aside) would otherwise need a
// view-transition-name on every thumbnail and title, creating dozens of
// snapshot groups per navigation that drown out the hero animation. Instead,
// name only the link involved in the navigation, just-in-time.
{
  const findLink = (url) => {
    const path = new URL(url).pathname;
    if (path === location.pathname) return null;
    return [...document.querySelectorAll("a[data-slug]")].find(
      (a) => a.pathname === path
    );
  };

  const setNames = (link) => {
    const slug = link.dataset.slug;
    const img = link.querySelector("img");
    const title = link.querySelector("h1, span");
    if (img) {
      img.style.viewTransitionName = `hero-image-${slug}`;
      img.style.viewTransitionClass = "heroImage";
    }
    if (title) {
      title.style.viewTransitionName = `heading-${slug}`;
      title.style.viewTransitionClass = "heading";
    }
    return () => {
      for (const el of [img, title]) {
        if (!el) continue;
        el.style.viewTransitionName = "";
        el.style.viewTransitionClass = "";
      }
    };
  };

  // Outgoing page: name the clicked card/list entry so it morphs into the
  // destination page's hero image and heading.
  window.addEventListener("pageswap", (e) => {
    if (!e.viewTransition || !e.activation) return;
    const link = findLink(e.activation.entry.url);
    if (link) setNames(link);
  });

  // Incoming homepage: name the card of the sponsor we came from, so its hero
  // morphs back into the card. Clean up once the transition ends.
  window.addEventListener("pagereveal", (e) => {
    if (!e.viewTransition || !document.body.classList.contains("isHomePage"))
      return;
    const from = navigation.activation?.from;
    if (!from) return;
    const link = findLink(from.url);
    if (!link) return;
    const cleanup = setNames(link);
    e.viewTransition.finished.finally(cleanup);
  });
}
