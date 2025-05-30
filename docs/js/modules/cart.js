class CartModule {
  constructor() {
    this.cartApiUrl = "http://localhost:3000/cart";
  }

  async getCart() {
    try {
      const response = await fetch(this.cartApiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching cart:", error);
      return [];
    }
  }

  async addToCart(product, quantity = 1, selectedColor = null, isFromDetail = false) {
    try {
      const cart = await this.getCart();

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
      console.log("Existing item:", existingItem);

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
      const cart = await this.getCart();
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

const cartModuleInstance = new CartModule();
export default cartModuleInstance;
