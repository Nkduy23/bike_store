// src/modules/cart.module.js
class CartModule {
  constructor(cartService) {
    this.cartService = cartService;
    this.cartItems = document.getElementById("cartItems");
    this.totalPrice = 0;
  }

  async init() {
    if (!this.cartItems) return;
    try {
      await this.renderCart();
    } catch (error) {
      console.error("Error initializing cart:", error);
    }
  }

  async addItem(product, quantity = 1, selectedColor = null) {
    try {
      await this.cartService.addItem(product, quantity, selectedColor);
      await this.renderCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }

  async updateItem(itemId, quantity, selectedColor = null) {
    try {
      await this.cartService.updateItem(itemId, quantity, selectedColor);
      await this.renderCart();
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  }

  async removeItem(itemId) {
    try {
      await this.cartService.removeItem(itemId);
      await this.renderCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  }

  async renderCart() {
    if (!this.cartItems) return;
    const template = document.getElementById("cartTemplate");
    if (!template) {
      console.error("Cart template not found");
      return;
    }

    const cart = await this.cartService.getCartItems();
    if (cart.length === 0) {
      this.cartItems.innerHTML = '<h1 class="empty-cart">Giỏ hàng trống</h1>';
      return;
    }

    this.totalPrice = cart.reduce((total, item) => {
      const price = item.priceSale || item.priceOriginal;
      return total + price * item.quantity;
    }, 0);

    const fragment = document.createDocumentFragment();
    const tbody = document.createElement("tbody");
    cart.forEach((item) => {
      const clone = template.content.cloneNode(true);
      clone.querySelector(".cart-stt").textContent = item.stt;
      const img = clone.querySelector(".cart-image");
      img.src = item.image;
      img.alt = item.name;
      clone.querySelector(".cart-name").textContent = item.name;
      clone.querySelector(".cart-color").textContent = item.selectedColor || "Chưa chọn";
      const quantityInput = clone.querySelector(".quantity-input");
      quantityInput.value = item.quantity;
      quantityInput.dataset.itemId = item.id;
      clone.querySelector(".cart-price").textContent = (item.priceSale || item.priceOriginal).toLocaleString() + "đ";
      clone.querySelector(".remove-from-cart").dataset.itemId = item.id;

      tbody.appendChild(clone);
    });

    const table = document.createElement("table");
    table.className = "cart-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>STT</th>
          <th>Hình ảnh</th>
          <th>Tên sản phẩm</th>
          <th>Màu sắc</th>
          <th>Số lượng</th>
          <th>Giá</th>
          <th>Hành động</th>
        </tr>
      </thead>
    `;
    table.appendChild(tbody);

    const summary = document.createElement("div");
    summary.className = "cart-summary";
    summary.innerHTML = `
      <h2>Tổng cộng: ${this.totalPrice.toLocaleString()}đ</h2>
      <button class="checkout-btn">Thanh toán</button>
    `;

    fragment.appendChild(table);
    fragment.appendChild(summary);

    this.cartItems.innerHTML = "";
    this.cartItems.appendChild(fragment);

    this.addEventListeners();
  }

  addEventListeners() {
    const removeButtons = this.cartItems.querySelectorAll(".remove-from-cart");
    removeButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const itemId = button.dataset.itemId;
        try {
          await this.removeItem(itemId);
        } catch (error) {
          alert("Có lỗi khi xóa sản phẩm. Vui lòng thử lại!");
        }
      });
    });

    const quantityInputs = this.cartItems.querySelectorAll(".quantity-input");
    quantityInputs.forEach((input) => {
      input.addEventListener("change", async () => {
        const itemId = input.dataset.itemId;
        const quantity = parseInt(input.value);
        if (quantity < 1) {
          input.value = 1;
          return;
        }
        try {
          await this.updateItem(itemId, quantity);
        } catch (error) {
          alert("Có lỗi khi cập nhật số lượng. Vui lòng thử lại!");
        }
      });
    });

    const checkoutBtn = this.cartItems.querySelector(".checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        alert("Chức năng thanh toán đang được phát triển!");
      });
    }
  }
}

export default function cartModule(cartService) {
  return new CartModule(cartService);
}
