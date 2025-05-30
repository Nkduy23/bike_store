import headerFooter from "./utils/header-footer.js";
import cartModuleInstance from "./modules/cart.js";

class Cart {
  constructor() {
    this.cartItems = document.getElementById("cartItems");
    this.cartModule = cartModuleInstance;
    this.init();
  }

  async init() {
    try {
      await headerFooter();
      await this.renderCart();
    } catch (error) {
      console.error("Error loading cart:", error);
      if (this.cartItems) {
        this.cartItems.innerHTML = "<h1>Giỏ hàng trống</h1>";
      }
    }
  }

  async renderCart() {
    if (!this.cartItems) return;

    const cart = await this.cartModule.getCart();
    if (cart.length === 0) {
      this.cartItems.innerHTML = "<h1>Giỏ hàng trống</h1>";
      return;
    }
    this.cartItems.innerHTML = cart
      .map(
        (item) => `
        <div class="container-main">
          <span>${item.stt}</span>
          <span>${item.quantity}</span>
          <img src="${item.image}" alt="${item.name}">
          <span>${item.name} (${item.selectedColor || "Chưa chọn màu"}) x${item.quantity}</span>
          <span>Giá: ${item.priceSale?.toLocaleString() || item.priceOriginal.toLocaleString()}đ</span>
          <button class="remove-from-cart" data-item-id="${item.id}">Xóa</button> <!-- Sửa data-product-id thành data-item-id -->
        </div>
      `
      )
      .join("");
    this.addEventListeners();
  }

  addEventListeners() {
    const removeButtons = document.querySelectorAll(".remove-from-cart");
    removeButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        const itemId = button.getAttribute("data-item-id");
        try {
          await this.cartModule.removeFromCart(itemId);
          await this.renderCart(); // Cập nhật lại giỏ hàng sau khi xóa
        } catch (error) {
          console.error("Error removing item:", error);
          alert("Có lỗi khi xóa sản phẩm. Vui lòng thử lại!");
        }
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => new Cart());
