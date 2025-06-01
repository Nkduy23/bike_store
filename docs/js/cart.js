import headerFooter from "./utils/header-footer.js";
import cartModuleInstance from "./modules/cart.js";
import DataService from "./modules/dataService.js";

class CartManager {
  constructor() {
    this.dataService = DataService;
    this.cartManager = cartModuleInstance;
  }

  async initCart() {
    try {
      await headerFooter();
      await this.cartManager.init();
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
