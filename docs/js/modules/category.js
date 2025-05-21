class CategoryManager {
  constructor() {
    this.categorieList = document.getElementById("categoryList");
    this.apiUrl = "/../src/data/categories.json";

    this.init();
  }

  async init() {
    try {
      await this.fetchCategories();
      this.renderCategories();
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  async fetchCategories() {
    const response = await fetch(this.apiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    this.categories = await response.json();
  }

  renderCategories() {
    this.categorieList.innerHTML = "";
    this.categories.forEach((category) => {
      const categoryItem = document.createElement("div");
      categoryItem.className = "category-item";
      categoryItem.innerHTML = `
        <img src="${category.image}" alt="${category.name}">
        <div class="category-name">${category.name}</div>
      `;
      this.categorieList.appendChild(categoryItem);
    });
  }
}

export default CategoryManager;
