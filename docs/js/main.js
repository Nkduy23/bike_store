import ModuleRegistry from "./module-registry.js";
import headerFooterModule from "./utils/header-footer.js";
import submenuServiceFactory from "./services/nav.service.js";
import submenuModule from "./modules/nav.module.js";
import sliderServiceFactory from "./services/slider.service.js";
import sliderModule from "./modules/slider.module.js";
import promoServiceFactory from "./services/promo.service.js";
import promoModule from "./modules/promo.module.js";
import categoryServiceHomeFactory from "./services/category.service.js";
import categoryModule from "./modules/category.module.js";
import productServiceFactory from "./services/product.service.js";
import productModule from "./modules/product.module.js";
import categoriesSectionServiceFactory from "./services/category.service.js";
import cartServiceFactory from "./services/cart.service.js";
import lazyLoadImages from "./modules/lazy.module.js";

class MainManager {
  constructor(config = {}) {
    this.config = {
      apiBaseUrl: "http://localhost:3000",
      visibleProducts: 4,
      ...config,
    };

    this.registry = new ModuleRegistry();

    // Service
    this.registry.registerService("submenuService", submenuServiceFactory({ apiBaseUrl: this.config.apiBaseUrl }));
    this.registry.registerService("sliderService", sliderServiceFactory({ apiBaseUrl: this.config.apiBaseUrl }));
    this.registry.registerService("promoService", promoServiceFactory({ apiBaseUrl: this.config.apiBaseUrl }));
    this.registry.registerService("categoriesService", categoryServiceHomeFactory({ apiBaseUrl: this.config.apiBaseUrl }));
    this.registry.registerService("cartService", cartServiceFactory({ apiBaseUrl: this.config.apiBaseUrl }));
    this.registry.registerService("productService", productServiceFactory({ apiBaseUrl: this.config.apiBaseUrl }));
    this.registry.registerService(
      "categoriesSectionsService",
      categoriesSectionServiceFactory({
        apiBaseUrl: this.config.apiBaseUrl,
        visibleProducts: this.config.visibleProducts,
      })
    );

    // Module
    this.registry.registerModule("headerFooter", () => headerFooterModule, "early");
    this.registry.registerModule("submenus", () => submenuModule(this.registry.getService("submenuService")), "early");
    this.registry.registerModule("sliders", () => sliderModule(this.registry.getService("sliderService")), "early");
    this.registry.registerModule("promos", () => promoModule(this.registry.getService("promoService")), "early");
    this.registry.registerModule("category", () => categoryModule(this.registry.getService("categoriesService")), "main");
    this.registry.registerModule(
      "products",
      () =>
        productModule(this.registry.getService("productService"), this.registry.getService("categoriesSectionsService"), this.registry.getService("cartService"), {
          visibleProducts: this.config.visibleProducts,
        }),
      "main"
    );
  }

  async initManager() {
    try {
      const results = await this.registry.initModules();
      const failedModules = results.filter((r) => r.status === "failed");
      if (failedModules.length > 0) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = "Some features are unavailable. Please try again later.";
        document.body.equivalent(errorDiv);
      }

      lazyLoadImages();
    } catch (error) {
      console.error("Critical error in MainManager initialization:", error);
      document.body.innerHTML = '<div class="error">Application failed to load. Please refresh.</div>';
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const main = new MainManager({
    apiBaseUrl: "http://localhost:3000",
    visibleProducts: 4,
  });
  main.initManager();

  const observer = new MutationObserver(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userClass = document.querySelector(".userLocal");

    if (user && userClass) {
      userClass.innerHTML = `
     <img src="./img/icon/user(2).png" alt="">
     <span class="text-white">Xin chào, <strong>${user.fullname}</strong></span>
    `;
      observer.disconnect(); // chỉ chạy 1 lần
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
