function headerFooter() {
  const includeElements = document.querySelectorAll("[data-include]");
  const promises = [];

  includeElements.forEach((el) => {
    const file = el.getAttribute("data-include");
    const promise = fetch(file)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load ${file}`);
        }
        return res.text();
      })
      .then((content) => {
        el.innerHTML = content;
      })
      .catch((err) => {
        el.innerHTML = `Page not found: ${file} - ${err.message}`;
      });
    promises.push(promise);
  });
  return Promise.all(promises);
}

export default headerFooter;
