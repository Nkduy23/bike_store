class CartModule {
  constructor(dataServiceManager) {
    this.cartItems = document.getElementById("cartItems");
    this.cart = [];
    this.dataService = dataServiceManager;
    this.cartApiUrl = "http://localhost:3000/cart";
    this.totalPrice = 0;
  }

  async init() {
    try {
      this.cart = await this.dataService.fetchCart();
      await this.renderCart();
    } catch (error) {
      console.error("Error initializing cart:", error);
    }
  }

  async renderCart() {
    if (!this.cartItems) return;
    const cart = this.cart;

    if (cart.length === 0) {
      this.cartItems.innerHTML = "<h1>Giỏ hàng trống</h1>";
      return;
    }

    this.totalPrice = cart.reduce((total, item) => {
      const price = item.priceSale || item.priceOriginal;
      return total + price * item.quantity;
    }, 0);

    this.cartItems.innerHTML = `
      <table class="cart-table">
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
        <tbody>
          ${cart
            .map(
              (item) => `
            <tr>
              <td>${item.stt}</td>
              <td><img src="${item.image}" alt="${item.name}" class="cart-image"></td>
              <td>${item.name}</td>
              <td>${item.selectedColor || "Chưa chọn"}</td>
              <td>
                <input type="number" class="quantity-input" data-item-id="${item.id}" value="${item.quantity}" min="1">
              </td>
              <td>${(item.priceSale || item.priceOriginal).toLocaleString()}đ</td>
              <td><button class="remove-from-cart" data-item-id="${item.id}">Xóa</button></td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      <div class="cart-summary">
        <h2>Tổng cộng: ${this.totalPrice.toLocaleString()}đ</h2>
        <button class="checkout-btn">Thanh toán</button>
      </div>
    `;
    this.addEventListeners();
  }

  addEventListeners() {
    const removeButtons = document.querySelectorAll(".remove-from-cart");
    removeButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        const itemId = button.getAttribute("data-item-id");
        try {
          await this.removeFromCart(itemId);
          await this.renderCart();
        } catch (error) {
          console.error("Error removing item:", error);
          alert("Có lỗi khi xóa sản phẩm. Vui lòng thử lại!");
        }
      });
    });

    const quantityInputs = document.querySelectorAll(".quantity-input");
    quantityInputs.forEach((input) => {
      input.addEventListener("change", async (e) => {
        const itemId = input.getAttribute("data-item-id");
        const quantity = parseInt(input.value);
        if (quantity < 1) {
          input.value = 1;
          return;
        }
        try {
          const item = this.cart.find((item) => item.id === itemId);
          if (item) {
            await this.updateCartItem(itemId, quantity, item.selectedColor);
            await this.renderCart();
          }
        } catch (error) {
          console.error("Error updating quantity:", error);
          alert("Có lỗi khi cập nhật số lượng. Vui lòng thử lại!");
        }
      });
    });

    const checkoutBtn = document.querySelector(".checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        alert("Chức năng thanh toán đang được phát triển!");
      });
    }
  }

  async addToCart(product, quantity = 1, selectedColor = null, isFromDetail = false) {
    try {
      if (!this.cart || this.cart.length === 0) {
        this.cart = await this.dataService.fetchCart();
      }

      const cart = this.cart;
      const cartItem = {
        productId: product.id,
        stt: cart.length + 1,
        name: product.name,
        image: product.image,
        priceSale: product.priceSale,
        priceOriginal: product.priceOriginal,
        quantity: quantity,
        selectedColor: selectedColor,
        requiresSelection: !isFromDetail,
      };

      // Tìm existingItem với productId và selectedColor (null cũng được so sánh)
      const existingItem = cart.find((item) => Number(item.productId) === Number(product.id) && (item.selectedColor === selectedColor || (item.selectedColor === null && selectedColor === null)));

      if (existingItem) {
        await this.updateCartItem(existingItem.id, existingItem.quantity + quantity, selectedColor);
      } else {
        const response = await fetch(this.cartApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cartItem),
        });
        if (!response.ok) {
          throw new Error("Failed to add cart item");
        }
        console.log("Đã thêm vào giỏ hàng:", cartItem);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }

  async updateCartItem(itemId, quantity, selectedColor = null) {
    try {
      if (!this.cart || this.cart.length === 0) {
        this.cart = await this.dataService.fetchCart();
      }

      const cart = this.cart;
      const itemToUpdate = cart.find((item) => item.id === itemId);

      if (!itemToUpdate) {
        throw new Error("Cart item not found for update");
      }

      const updatedItem = {
        ...itemToUpdate,
        quantity: quantity,
        selectedColor: selectedColor || itemToUpdate.selectedColor,
        requiresSelection: itemToUpdate.requiresSelection,
      };

      const response = await fetch(`${this.cartApiUrl}/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedItem),
      });

      if (!response.ok) {
        throw new Error(`Failed to update cart item: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  }

  async removeFromCart(itemId) {
    try {
      const response = await fetch(`${this.cartApiUrl}/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to remove from cart");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  }
}

export default function cartModuleInstance(dataServiceManager) {
  return new CartModule(dataServiceManager);
}
