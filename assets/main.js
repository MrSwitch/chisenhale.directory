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
