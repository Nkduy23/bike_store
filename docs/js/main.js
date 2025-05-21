import includeHTML from "./utils/include.js";
import renderSubmenu from "./modules/nav.js";
import Slider from "./modules/slider.js";
import CategoryManager from "./modules/category.js";
import ProductsManager from "./modules/products.js";

class App {
  async init() {
    try {
      await includeHTML();
      renderSubmenu();
      new Slider();
      new CategoryManager().init();
      const product1 = new ProductsManager();
      product1.productList = document.getElementById("productList");
      product1.init("Xe Đạp Trẻ Em");

      const product2 = new ProductsManager();
      product2.productList = document.getElementById("productList2");
      product2.init("Xe Đạp Thể Thao");

      const product3 = new ProductsManager();
      product3.productList = document.getElementById("productList3");
      product3.init("Xe Đạp Địa Hình");
      
    } catch (error) {
      console.error("Error loading HTML:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init();
});
