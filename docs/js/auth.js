import AuthModule from "./modules/auth.js";
import DataService from "./modules/dataService.js";

class AuthManager {
  constructor() {
    this.dataService = DataService;
    this.authManager = AuthModule;
  }

  init() {
    this.authManager.init();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const auth = new AuthManager();
  auth.init();
});
