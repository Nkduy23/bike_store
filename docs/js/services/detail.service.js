import BaseService from "./base.service.js";

class DetailService extends BaseService {
  constructor(config = {}) {
    super("products", config);
  }

  async getProductById(productId) {
    try {
      const response = await this.request(`/${productId}`);
      if (!response) {
        throw new Error("Product not found");
      }
      return response;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

  async getReviewsByProductId(productId) {
    try {
      const response = await this.request(`/${productId}/reviews`);
      return response || [];
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  }

  async addReview(productId, review) {
    try {
      const response = await this.request(`/${productId}/reviews`, "POST", review);
      if (!response) {
        throw new Error("Failed to add review");
      }
      return response;
    } catch (error) {
      console.error("Error adding review:", error);
      throw error;
    }
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async getRelatedProducts(productId) {
    try {
      const product = await this.getProductById(productId);
      const allProducts = await this.request("");
      const related = this.shuffle(allProducts.filter((p) => p.category === product.category && p.id !== productId));
      return related;
    } catch (error) {
      console.error("Error fetching related products: ", error);
      return [];
    }
  }

  async getPolicies() {
    try {
      const response = await this.request("/policies", "GET", null, true);
      return response || { shippingPolicies: [], warrantyPolicies: [] };
    } catch (error) {
      console.error("Error fetching policies:", error);
      return { shippingPolicies: [], warrantyPolicies: [] };
    }
  }
}

export default (config) => new DetailService(config);
