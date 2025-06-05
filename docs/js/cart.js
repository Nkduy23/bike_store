import headerFooterInstance from "./utils/header-footer.js";
import cartModuleInstance from "./modules/cart-module.js";
import DataServiceInstance from "./modules/fetch-module.js";

class CartManager {
  constructor() {
    this.dataServiceManager = DataServiceInstance;
    this.headerFooterManager = headerFooterInstance;
    this.cartManager = cartModuleInstance(this.dataServiceManager);
  }

  async initCart() {
    try {
      await Promise.all([
        Promise.resolve(this.headerFooterManager.init()).catch((err) => {
          console.error("Header/Footer init failed:", err);
          return null;
        }),
        Promise.resolve(this.cartManager.init()).catch((err) => {
          console.error("Cart init failed:", err);
          return null;
        }),
      ]);
    } catch (error) {
      console.error("Error loading cart:", error);
      if (this.cartItems) {
        this.cartItems.innerHTML = "<h1>Giỏ hàng trống</h1>";
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const cart = new CartManager();
  cart.initCart();
});
