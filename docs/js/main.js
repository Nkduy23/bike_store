import headerFooter from "./utils/header-footer.js";
import renderSubmenu from "./modules/nav.js";
import sliderModuleInstance from "./modules/slider.js";
import categoryModuleInstance from "./modules/category.js";
import productModule from "./modules/product.js";
import cartModuleInstance from "./modules/cart.js";
import lazyLoadImages from "./modules/lazy.js";

class MainManager {
  constructor() {
    this.sliderManager = sliderModuleInstance;
    this.categoryManager = categoryModuleInstance;
    this.cartManager = cartModuleInstance;
    this.productsManager = new productModule(this.cartManager);
  }
  async initManager() {
    try {
      await headerFooter();
      renderSubmenu();

      const productLists = [
        { elementId: "productList", category: "Xe Đạp Trẻ Em" },
        { elementId: "productList2", category: "Xe Đạp Thể Thao" },
        { elementId: "productList3", category: "Xe Đạp Địa Hình" },
        { elementId: "productList4", category: "Xe Đạp Đua" },
        { elementId: "productList5", category: "Xe Đạp Touring" },
        { elementId: "productList6", category: "Xe Đạp Nữ" },
        { elementId: "productList7", category: "Xe Đạp Điện" },
        { elementId: "productList8", category: "Xe Đạp Khác" },
      ];
      await this.productsManager.init(productLists);
      lazyLoadImages();
    } catch (error) {
      console.error("Error loading HTML:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const main = new MainManager();
  main.initManager();
});
