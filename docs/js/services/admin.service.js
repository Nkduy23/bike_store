import BaseService from "./base.service.js";

class AdminService {
  constructor(config = {}) {
    this.services = {
      categories: new BaseService("categories", config),
      products: new BaseService("products", config),
      users: new BaseService("users", config),
      reviews: new BaseService("reviews", config),
      policies: new BaseService("policies", config),
    };
  }

  // Categories
  async getCategories() {
    return this.services.categories.request("");
  }

  async createCategory(category) {
    return this.services.categories.request("", "POST", category);
  }

  async updateCategory(id, category) {
    return this.services.categories.request(`/${id}`, "PUT", category);
  }

  async deleteCategory(id) {
    return this.services.categories.request(`/${id}`, "DELETE", null, false);
  }

  // Products
  async getProducts() {
    return this.services.products.request("");
  }

  async getProduct(id) {
    return this.services.products.request(`/${id}`);
  }

  async createProduct(product) {
    return this.services.products.request("", "POST", product);
  }

  async updateProduct(id, product) {
    return this.services.products.request(`/${id}`, "PUT", product);
  }

  async deleteProduct(id) {
    return this.services.products.request(`/${id}`, "DELETE");
  }

  // Users
  async getUsers() {
    return this.services.users.request("");
  }

  async createUser(user) {
    return this.services.users.request("", "POST", user);
  }

  async updateUser(id, user) {
    return this.services.users.request(`/${id}`, "PUT", user);
  }

  async deleteUser(id) {
    return this.services.users.request(`/${id}`, "DELETE");
  }

  // Reviews
  async getReviews() {
    return this.services.reviews.request("");
  }

  async updateReview(id, review) {
    return this.services.reviews.request(`/${id}`, "PUT", review);
  }

  async deleteReview(id) {
    console.log(id);
    debugger;
    return this.services.reviews.request(`/${id}`, "DELETE");
  }

  // Policies
  async getPolicies() {
    return this.services.policies.request("");
  }

  async updatePolicies(policies) {
    return this.services.policies.request("", "PUT", policies);
  }
}

export default (config) => new AdminService(config);
