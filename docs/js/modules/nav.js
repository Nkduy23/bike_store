import submenusData from "./submenusData.js";
function renderSubmenu() {
  const menuTriggers = document.querySelectorAll(".menu-trigger");

  // Kiểm tra số lượng menu trigger và submenusData khớp
  if (menuTriggers.length !== submenusData.length) {
    console.error("Number of menu triggers and submenusData");
    return;
  }

  menuTriggers.forEach((menuTrigger, index) => {
    const submenu = menuTrigger.nextElementSibling;

    if (!menuTrigger || !submenu) {
      console.error("Menu trigger or submenu not found for this item");
      return;
    }

    // Lấy dữ liệu submenu tương ứng
    const currentSubmenuData = submenusData[index];

    // Tạo nội dung submenu
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

    // Lắng nghe sự kiện hover
    menuTrigger.addEventListener("mouseenter", () => {
      submenu.style.visibility = "visible";
    });

    menuTrigger.addEventListener("mouseleave", () => {
      submenu.style.visibility = "hidden";
    });

    // Sự kiện hover cho submenu
    submenu.addEventListener("mouseenter", () => {
      submenu.style.visibility = "visible"; // Giữ hiển thị khi chuột vào submenu
    });

    submenu.addEventListener("mouseleave", () => {
      submenu.style.visibility = "hidden"; // Ẩn khi chuột rời khỏi submenu
    });
  });
}

export default renderSubmenu;
