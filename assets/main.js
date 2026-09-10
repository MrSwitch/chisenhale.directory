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
