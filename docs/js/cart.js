import ModuleRegistry from "./module-registry.js";
import headerFooterModule from "./utils/header-footer.js";
import cartServiceFactory from "./services/cart.service.js";
import cartModule from "./modules/cart.module.js";

class CartManager {
  constructor(config = {}) {
    this.config = {
      apiBaseUrl: "http://localhost:3000",
      ...config,
    };

    this.registry = new ModuleRegistry();

    // Đăng ký services
    this.registry.registerService("cartService", cartServiceFactory({ apiBaseUrl: this.config.apiBaseUrl }));

    // Đăng ký modules
    this.registry.registerModule("headerFooter", () => headerFooterModule, "early");
    this.registry.registerModule("cart", () => cartModule(this.registry.getService("cartService")), "main");
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
      console.error("Critical error in CartManager initialization:", error);
      document.body.innerHTML = '<div class="error">Application failed to load. Please refresh.</div>';
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const cart = new CartManager();
  cart.initManager();
});
