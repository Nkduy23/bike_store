import ModuleRegistry from "./module-registry.js";
import headerFooterModule from "./utils/header-footer.js";
import detailServiceFactory from "./services/detail.service.js";
import productDetailModule from "./modules/detail.module.js";
import cartServiceFactory from "./services/cart.service.js";

class DetailManager {
  constructor(config = {}) {
    this.config = {
      apiBaseUrl: "http://localhost:3000",
      ...config,
    };

    this.registry = new ModuleRegistry();

    // Đăng ký services
    this.registry.registerService("productDetailService", detailServiceFactory({ apiBaseUrl: this.config.apiBaseUrl }));
    this.registry.registerService("cartService", cartServiceFactory({ apiBaseUrl: this.config.apiBaseUrl }));

    // Đăng ký modules
    this.registry.registerModule("headerFooter", () => headerFooterModule, "early");
    this.registry.registerModule("productDetail", () => productDetailModule(this.registry.getService("productDetailService"), this.registry.getService("cartService")), "main");
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
        document.body.prepend(errorDiv);
      }
    } catch (error) {
      console.error("Critical error in DetailManager initialization:", error);
      document.body.innerHTML = '<div class="error">Application failed to load. Please refresh.</div>';
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const detail = new DetailManager();
  detail.initManager();
});
