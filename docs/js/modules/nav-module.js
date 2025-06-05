class SubMenuModule {
  constructor(dataServiceInstance) {
    this.menuTriggers = document.querySelectorAll(".menu-trigger");
    this.dataService = dataServiceInstance;
  }

  async init() {
    try {
      const submenus = await this.dataService.fetchSubMenu();

      // Nhóm submenus theo menuId
      const groupedSubmenus = {};
      submenus.forEach((submenu) => {
        const menuId = submenu.menuId;
        if (!groupedSubmenus[menuId]) {
          groupedSubmenus[menuId] = [];
        }
        groupedSubmenus[menuId].push(submenu);
      });

      this.renderSubmenus(groupedSubmenus);
    } catch (error) {
      console.error("Failed to fetch or render submenu data:", error);
    }
  }

  renderSubmenus(groupedSubmenus) {
    this.menuTriggers.forEach((menuTrigger) => {
      const menuId = menuTrigger.getAttribute("data-menu-id");
      const submenu = menuTrigger.nextElementSibling;

      if (!menuTrigger || !submenu) {
        console.error("Menu trigger or submenu not found for this item");
        return;
      }

      if (!menuId) {
        console.error("Menu trigger does not have data-menu-id attribute");
        return;
      }

      const currentSubmenuData = groupedSubmenus[menuId] || [];

      if (!currentSubmenuData.length) {
        console.warn(`No submenu data found for menuId: ${menuId}`);
        return;
      }

      submenu.innerHTML = "";

      currentSubmenuData.forEach((column) => {
        const ul = document.createElement("ul");
        const title = document.createElement("li");
        title.className = "pb-size-15 pl-size-15 text-size-15";
        title.innerHTML = `<strong>${column.title}</strong>`;
        ul.appendChild(title);

        column.items.forEach((item) => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.className = "block text-black text-u-none p-size-15 text-size-15";
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
}

export default function submenuModuleInstance(dataServiceInstance) {
  return new SubMenuModule(dataServiceInstance);
}
