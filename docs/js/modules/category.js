class CategoryModule {
  constructor() {
    this.categorieList = document.getElementById("categoryList");
    this.apiUrl = "http://localhost:3000/categories";
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
      <div 
        class="category-box flex flex-col items-center justify-between gap-sm cursor-pointer p-sm border border-gray-200 rounded hover:shadow transition"
        style="aspect-ratio: 1 / 1; min-height: 8rem; box-sizing: border-box;"
      >
        <img 
          src="${category.image}" 
          alt="${category.name}" 
          style="width: 60%; aspect-ratio: 1 / 1; object-fit: contain;"
          loading="lazy"
        >
        <div 
          class="category-name text-center text-sm font-medium" 
          style="min-height: 2rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
        >
          ${category.name}
        </div>
      </div>
    `;

      categoryItem.addEventListener("click", () => {
        this.handleCategoryClick(category);
      });

      this.categorieList.appendChild(categoryItem);
    });
  }

  handleCategoryClick(category) {
    const url = `category.html?category=${category.name}`;
    window.location.href = url;
  }
}

const categoryModuleInstance = new CategoryModule();
export default categoryModuleInstance;
