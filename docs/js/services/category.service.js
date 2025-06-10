import BaseService from "./base.service.js";

class CategoryService extends BaseService {
  constructor(config = {}) {
    super("categories", config);
    this.visibleProducts = config.visibleProducts || 4;
  }

  async getCategorySections() {
    const response = await this.request("Sections");

    if (!response) {
      throw new Error("Failed to fetch category sections");
    }

    return response.map((section) => ({
      element: document.getElementById(section.elementId),
      category: section.category,
      visibleCount: this.visibleProducts,
    }));
  }

  async getCategories() {
    return this.request("");
  }
}

export default (config) => new CategoryService(config);
