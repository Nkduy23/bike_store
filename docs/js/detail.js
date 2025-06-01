import headerFooter from "./utils/header-footer.js";
import DataService from "./modules/dataService.js";
import DetailModule from "./modules/detail.js";
import cartModuleInstance from "./modules/cart.js";

class DetailManager {
  constructor() {
    this.cartManager = cartModuleInstance;
    this.dataService = DataService;
    this.detailManager = new DetailModule(this.cartManager, this.dataService);
  }
  async initDetail() {
    try {
      await headerFooter();
      await this.detailManager.init();
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const detail = new DetailManager();
  detail.initDetail();
});
