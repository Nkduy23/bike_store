class CategoryModule {
  constructor(categoryService) {
    this.categoryList = document.getElementById("categoryList");
    this.categoryService = categoryService;
    this.categories = null;
  }

  async init() {
    try {
      this.categories = await this.categoryService.getCategories();
      if (!this.categories || this.categories.length === 0) {
        console.warn("No categories data available");
        return;
      }
      this.renderCategories();
    } catch (error) {
      console.error("Error initializing categories:", error);
      throw error;
    }
  }

  renderCategories() {
    const template = document.getElementById("categoryTemplate");
    if (!template || !this.categoryList) {
      console.error("Category template or list container not found");
      throw new Error("Category template or list container not found");
    }

    const fragment = document.createDocumentFragment();
    this.categories.forEach((category) => {
      const clone = template.content.cloneNode(true);
      const img = clone.querySelector("img");
      const name = clone.querySelector(".category-name");

      img.src = category.image;
      img.alt = category.name;
      name.textContent = category.name;

      const categoryItem = clone.querySelector(".category-item");
      categoryItem.addEventListener("click", () => {
        this.handleCategoryClick(category);
      });

      fragment.appendChild(clone);
    });
    this.categoryList.innerHTML = "";
    this.categoryList.appendChild(fragment);
  }
  handleCategoryClick(category) {
    const url = `category.html?categoryId=${category.id}`;
    window.location.href = url;
  }
}

export default function categoryModule(categoryService) {
  return new CategoryModule(categoryService);
}
