import ModuleRegistry from "./module-registry.js";
import adminServiceFactory from "./services/admin.service.js";
import adminModule from "./modules/admin.module.js";
import authGuardFactory from "./middlewares/authGuard.js";
import lazyLoadImages from "./modules/lazy.module.js";

class AdminManager {
  constructor(config = {}) {
    this.config = {
      apiBaseUrl: "http://localhost:3000",
      visibleProducts: 4,
      ...config,
    };

    this.registry = new ModuleRegistry();

    // Service
    this.registry.registerService("adminService", adminServiceFactory({ apiBaseUrl: this.config.apiBaseUrl }));

    // Middleware
    const authGuard = authGuardFactory();
    this.registry.registerMiddleware(authGuard);

    // Module
    this.registry.registerModule("admin", () => adminModule(this.registry.getService("adminService"), authGuard), "main");
  }

  async initManager() {
    try {
      const results = await this.registry.initModules();
      const failedModules = results.filter((r) => r.status === "failed");
      if (failedModules.length > 0) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = "Some features are unavailable. Please try again later.";
        document.body.appendChild(errorDiv);
      }

      // Đảm bảo DOM sẵn sàng trước khi gọi lazyLoadImages
      await new Promise((resolve) => setTimeout(resolve, 0)); // Đợi một chu kỳ event loop
      lazyLoadImages();
    } catch (error) {
      console.error("Critical error in MainManager initialization:", error);
      document.body.innerHTML = '<div class="error">Application failed to load. Please refresh.</div>';
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const main = new AdminManager({
    apiBaseUrl: "http://localhost:3000",
    visibleProducts: 4,
  });
  main.initManager();
});
