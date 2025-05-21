import includeHTML from "./utils/include.js";
import ProductDetail from "./modules/product-detail.js";

class Detail {
  constructor() {
    this.productDetail = new ProductDetail();
  }
  async initDetail() {
    try {
      await includeHTML();
      await this.productDetail.init();
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new Detail();
  app.initDetail();
});
