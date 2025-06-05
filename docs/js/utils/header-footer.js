class HeaderFooter {
  constructor() {
    this.includeElements = document.querySelectorAll("[data-include]");
  }

  async init() {
    const promises = Array.from(this.includeElements).map(async (el) => {
      const file = el.getAttribute("data-include");
      try {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`Failed to load ${file}`);
        const content = await res.text();

        el.innerHTML = content;
      } catch (err) {
        console.error(err);
      }
    });
    return Promise.all(promises);
  }
}

const headerFooterInstance = new HeaderFooter();
export default headerFooterInstance;
