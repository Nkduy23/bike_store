// /admin.js
import adminInstance from "./modules/admin.module.js";
import DataService from "./modules/fetch.module.js";

class AdminManager {
  constructor() {
    this.adminModule = adminInstance;
    this.dataService = DataService;
  }

  init() {
    this.adminModule.init();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const admin = new AdminManager();
  admin.init();
});
