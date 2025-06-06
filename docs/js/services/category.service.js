import BaseService from "./base.service.js";

class CategoryService extends BaseService {
  constructor(config = {}) {
    super("categorySections", config);
    this.visibleProducts = config.visibleProducts || 4;
  }

  async getCategorySections() {
    const response = await this.request("");

    if (!response) {
      throw new Error("Failed to fetch category sections");
    }

    return response.map((section) => ({
      element: document.getElementById(section.elementId),
      category: section.category,
      visibleCount: this.visibleProducts,
    }));
  }

  async getHomeCategory() {
    return this.request("/homeCategory");
  }
}

export default (config) => new CategoryService(config);
