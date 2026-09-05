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

// Sponsor search: the nav search icon opens a native modal <dialog>
// containing the search input and compact sponsor cards, live-filtered by
// title as you type. Esc (native) or clicking the backdrop closes it.
{
  const form = document.getElementById("sponsorSearch");
  const panel = document.getElementById("sponsorSearchResults");
  const toggles = document.querySelectorAll("button.searchToggle");

  if (form && panel && toggles.length) {
    const input = form.elements.q;
    const cards = panel.querySelectorAll("a[data-title]");
    const noResults = panel.querySelector(".noResults");

    const filter = () => {
      const query = input.value.trim().toLowerCase();
      let matches = 0;
      for (const card of cards) {
        const match = card.dataset.title.toLowerCase().includes(query);
        card.hidden = !match;
        if (match) matches++;
      }
      noResults.hidden = matches > 0;
    };

    const setExpanded = (value) => {
      for (const toggle of toggles) {
        toggle.setAttribute("aria-expanded", value);
      }
    };

    const open = () => {
      filter();
      panel.showModal();
      setExpanded("true");
      input.focus();
    };

    panel.addEventListener("close", () => {
      setExpanded("false");
    });

    for (const toggle of toggles) {
      toggle.addEventListener("click", () => {
        if (panel.open) {
          panel.close();
        } else {
          // Close the nav dropdown so it isn't left open behind the dialog.
          toggle.closest("details")?.removeAttribute("open");
          open();
        }
      });
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      filter();
    });
    // Keyboard navigation: arrow keys move focus between visible result
    // cards (Enter follows the focused link natively); Esc closes the
    // dialog natively.
    const visibleCards = () => [...cards].filter((card) => !card.hidden);

    const moveFocus = (offset) => {
      const items = visibleCards();
      if (!items.length) return;
      const index = items.indexOf(document.activeElement);
      if (index === -1) {
        items[offset < 0 ? items.length - 1 : 0].focus();
      } else {
        const next = index + offset;
        if (next < 0) {
          input.focus();
        } else if (next < items.length) {
          items[next].focus();
        }
      }
    };

    input.addEventListener("input", filter);
    panel.addEventListener("keydown", (event) => {
      if (event.target === input) {
        // Only ArrowDown leaves the input; left/right move the text caret.
        if (event.key === "ArrowDown") {
          event.preventDefault();
          moveFocus(1);
        }
      } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        moveFocus(1);
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        moveFocus(-1);
      }
    });
    // Clicking the backdrop (outside the dialog's bounds) closes it.
    panel.addEventListener("click", (event) => {
      if (event.target === panel) {
        const rect = panel.getBoundingClientRect();
        const outside =
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom;
        if (outside) panel.close();
      }
    });

    const initial = new URLSearchParams(location.search).get("q");
    if (initial) {
      input.value = initial;
      open();
    }
  }
}
