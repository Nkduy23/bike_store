import BaseService from "./base.service.js";

class CartService extends BaseService {
  constructor(config = {}) {
    super("cart", config);
  }

  async getCartItems() {
    try {
      const response = await this.request("");
      if (!response) {
        throw new Error("Failed to fetch cart items");
      }
      return response;
    } catch (error) {
      console.error("Error fetching cart items:", error);
      throw error;
    }
  }

  async addItem(product, quantity = 1, selectedColor = null) {
    try {
      const items = await this.getCartItems();
      const existingItem = items.find((item) => Number(item.productId) === Number(product.id) && (item.selectedColor === selectedColor || (item.selectedColor === null && selectedColor === null)));
      if (existingItem) {
        return await this.updateItem(existingItem.id, existingItem.quantity + quantity, selectedColor);
      }

      const cartItem = {
        productId: product.id,
        stt: items.length + 1,
        name: product.name,
        image: product.image,
        priceSale: product.priceSale,
        priceOriginal: product.priceOriginal,
        quantity,
        selectedColor,
        id: Date.now().toString(), // Tạo ID tạm, có thể thay bằng UUID
      };

      const response = await this.request("", "POST", cartItem);
      if (!response) {
        throw new Error("Failed to add cart item");
      }
      return await this.getCartItems();
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }

  async updateItem(itemId, quantity, selectedColor = null) {
    try {
      const items = await this.getCartItems();
      const itemToUpdate = items.find((item) => item.id === itemId);
      if (!itemToUpdate) {
        throw new Error("Cart item not found for update");
      }

      const updatedItem = {
        ...itemToUpdate,
        quantity: Math.max(1, quantity),
        selectedColor: selectedColor || itemToUpdate.selectedColor,
      };

      const response = await this.request(`/${itemId}`, "PUT", updatedItem);
      if (!response) {
        throw new Error("Failed to update cart item");
      }
      return await this.getCartItems();
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  }

  async removeItem(itemId) {
    try {
      const response = await this.request(`/${itemId}`, "DELETE");
      if (!response) {
        throw new Error("Failed to remove cart item");
      }
      return await this.getCartItems();
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  }
}

export default (config) => new CartService(config);
