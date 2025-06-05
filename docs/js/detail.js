import DataServiceInstance from "./modules/fetch-module.js";
import headerFooterInstance from "./utils/header-footer.js";
import detailModuleInstance from "./modules/detail-module.js";
import cartModuleInstance from "./modules/cart-module.js";

class DetailManager {
  constructor() {
    this.dataServiceManager = DataServiceInstance;
    this.headerFooterManager = headerFooterInstance;
    this.cartManager = cartModuleInstance(this.dataServiceManager);
    this.detailManager = detailModuleInstance(this.cartManager, this.dataServiceManager);
  }
  async initDetail() {
    try {
      await Promise.all([
        Promise.resolve(this.headerFooterManager.init()).catch((err) => {
          console.error("Header/Footer init failed:", err);
          return null;
        }),
        Promise.resolve(this.detailManager.init()).catch((err) => {
          console.error("Detail init failed:", err);
          return null;
        }),
      ]);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const detail = new DetailManager();
  detail.initDetail();
});
