export class includeHTML {
  init() {
    const includeElements = document.querySelectorAll("[data-include]");

    includeElements.forEach(async (el) => {
      const file = el.getAttribute("data-include");
      try {
        const res = await fetch(file);
        const content = await res.text();
        el.innerHTML = content;
      } catch (err) {
        el.innerHTML = "Page not found" + file;
      }
    });
  }
}

console.log("include");
