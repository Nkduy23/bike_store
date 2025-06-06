class CategoryModule {
  constructor(dataServiceInstance) {
    this.categorieList = document.getElementById("categoryList");
    this.dataService = dataServiceInstance;
    this.categories = null;
  }

  async init() {
    try {
      this.categories = await this.dataService.fetchCategories();
      this.renderCategories();
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  renderCategories() {
    this.categorieList.innerHTML = "";
    this.categories.forEach((category) => {
      const categoryItem = document.createElement("div");
      categoryItem.className = "category-item";
      categoryItem.innerHTML = `
      <div 
        class="category-box flex flex-col items-center gap-size-1 cursor-pointer p-size-1"
        style="aspect-ratio: 1 / 1; min-height: 8rem;"
      >
        <img
          src="${category.image}" 
          alt="${category.name}" 
          style="width: 60%; aspect-ratio: 1 / 1; object-fit: contain;"
          loading="lazy"
        >
        <div 
          class="category-name text-center text-size-1 font-medium" 
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

export default function categoryModuleInstance(dataServiceInstance) {
  return new CategoryModule(dataServiceInstance);
}
