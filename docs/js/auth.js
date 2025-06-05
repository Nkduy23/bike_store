import "./utils/header-footer.js";
import AuthModule from "./modules/auth-module.js";
import DataService from "./modules/fetch-module.js";
import headerFooter from "./utils/header-footer.js";

class AuthManager {
  constructor() {
    this.dataService = DataService;
    this.authManager = AuthModule;
  }

  init() {
    headerFooter();
    this.authManager.init();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const auth = new AuthManager();
  auth.init();
});
