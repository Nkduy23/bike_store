import submenusData from "./submenusData.js";

function renderSubmenu() {
  const menuTriggers = document.querySelectorAll(".menu-trigger");

  if (menuTriggers.length !== submenusData.length) {
    console.error("length not match");
    return;
  }

  menuTriggers.forEach((menuTrigger, index) => {
    const submenu = menuTrigger.nextElementSibling;

    if (!menuTrigger || !submenu) {
      console.error("Menu trigger or submenu not found for this item");
      return;
    }

    const currentSubmenuData = submenusData[index];

    currentSubmenuData.forEach((column) => {
      const ul = document.createElement("ul");
      const title = document.createElement("li");
      title.className = "pb-md pl-md text-md";
      title.innerHTML = `<strong>${column.title}</strong>`;
      ul.appendChild(title);

      column.items.forEach((item) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.className = "block text-black text-u-none p-md text-md";
        a.href = item.href;
        a.textContent = item.text;
        li.appendChild(a);
        ul.appendChild(li);
      });
      submenu.appendChild(ul);
    });

    menuTrigger.addEventListener("mouseenter", () => {
      submenu.style.visibility = "visible";
    });

    menuTrigger.addEventListener("mouseleave", () => {
      submenu.style.visibility = "hidden";
    });

    submenu.addEventListener("mouseenter", () => {
      submenu.style.visibility = "visible";
    });

    submenu.addEventListener("mouseleave", () => {
      submenu.style.visibility = "hidden";
    });
  });
}

export default renderSubmenu;
