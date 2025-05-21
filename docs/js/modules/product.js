class CategoryManager {
  constructor() {
    this.categorieList = document.getElementById("categoryList");
    this.apiUrl = "/../data/category.json";

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

  renderCategory() {
    this.categorieList.innerHTML = "";
    this.categories.forEach((category) => {
      const productItem = document.createElement("div");
      productItem.className = "product-item";
      productItem.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div class="product-name">${product.name}</div>
        <div class="product-price">${product.price.toLocaleString()}đ</div>
      `;
      this.productList.appendChild(productItem);
    });
  }
}

export default CategoryManager;
