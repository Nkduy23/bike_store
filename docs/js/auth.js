import ModuleRegistry from "./module-registry.js";
import authServiceFactory from "./services/auth.service.js";
import authModule from "./modules/auth.module.js";
import authGuardFactory from "./middlewares/authGuard.js";

class AuthManager {
  constructor(config = {}) {
    this.config = {
      apiBaseUrl: "http://localhost:3000",
      ...config,
    };

    this.registry = new ModuleRegistry();

    // Service
    this.registry.registerService("authService", authServiceFactory({ apiBaseUrl: this.config.apiBaseUrl }));

    // Middleware: tạo instance riêng và dùng lại
    this.authGuard = authGuardFactory();
    this.registry.registerMiddleware(this.authGuard);

    // Module
    this.registry.registerModule(
      "auth",
      async () => {
        return authModule(this.registry.getService("authService"), this.authGuard); // không protect
      },
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
        document.body.appendChild(errorDiv);
      }
    } catch (error) {
      console.error("Critical error in MainManager initialization:", error);
      document.body.innerHTML = '<div class="error">Application failed to load. Please refresh.</div>';
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const auth = new AuthManager();
  auth.initManager();
});
