import dataServiceInstance from "./modules/fetch-module.js";
import headerFooterInstance from "./utils/header-footer.js";
import subMenuInstance from "./modules/nav-module.js";
import sliderModuleInstance from "./modules/slider-module.js";
import categoryModuleInstance from "./modules/category-module.js";
import productModuleInstance from "./modules/product-module.js";
import cartModuleInstance from "./modules/cart-module.js";
import lazyLoadImages from "./modules/lazy-module.js";

class MainManager {
  constructor() {
    this.dataServiceManager = dataServiceInstance;
    this.cartManager = cartModuleInstance(this.dataServiceManager);
    this.headerFooterManager = headerFooterInstance;
    this.subMenuManager = subMenuInstance(this.dataServiceManager);
    this.sliderManager = sliderModuleInstance;
    this.categoryManager = categoryModuleInstance(this.dataServiceManager);
    this.productsManager = productModuleInstance(this.cartManager, this.dataServiceManager);
  }
  async initManager() {
    try {
      await Promise.all([
        Promise.resolve(this.headerFooterManager.init()).catch((err) => {
          console.error("Header/Footer init failed:", err);
          return null;
        }),
        Promise.resolve(this.subMenuManager.init()).catch((err) => {
          console.error("SubMenu init failed:", err);
          return null;
        }),
        Promise.resolve(this.sliderManager.init()).catch((err) => {
          console.error("Slider init failed:", err);
          return null;
        }),
        Promise.resolve(this.categoryManager.init()).catch((err) => {
          console.error("Category init failed:", err);
          return null;
        }),
      ]);

      await this.productsManager.init().catch((err) => {
        console.error("Products init failed:", err);
      });

      lazyLoadImages();
      console.log("MainManager initialized successfully");
    } catch (error) {
      console.error("Error in MainManager initialization:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const main = new MainManager();
  main.initManager();
});
