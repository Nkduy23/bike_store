import { ModuleRegistry } from "./module-registry.js";
import productServiceFactory from "./services/product.service.js";
import categoryServiceFactory from "./services/category.service.js";
import submenuService from "./services/submenu.service.js";
import headerFooterModule from "./utils/header-footer.js";
// import submenuModule from "./modules/nav.module.js";
import ProductModule from "./modules/product.module.js";
import lazyLoadImages from "./modules/lazy.module.js";

class MainManager {
  constructor(config = {}) {
    this.config = {
      apiBaseUrl: "http://localhost:3000",
      visibleProducts: 4,
      ...config,
    };

    this.registry = new ModuleRegistry();

    // Dang ky services
    // this.registry.registerService("productService", productServiceInstance) sau đó tiếp tục chạy registerService 
    this.registry.registerService("productService", productServiceFactory({ apiBaseUrl: this.config.apiBaseUrl }));
    this.registry.registerService(
      "categoryService",
      categoryServiceFactory({
        apiBaseUrl: this.config.apiBaseUrl,
        visibleProducts: this.config.visibleProducts,
      })
    );
    // this.registry.registerService("submenuService", productServiceFactory({ apiBaseUrl: this.config.apiBaseUrl }));

    // Dang ky modules
    this.registry.registerModule("headerFooter", () => headerFooterModule, "early");
    // this.registry.registerModule("submenu", () => submenuModule(this.registry.getService("submenuService")), "early");
    this.registry.registerModule(
      "products",
      () =>
        ProductModule(this.registry.getService("productService"), this.registry.getService("categoryService"), {
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
        console.warn("Some modules failed to initialize:", failedModules);
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
});
