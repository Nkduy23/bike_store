import dataService from "./dataService.js";
class CategoryModule {
  constructor(dataService) {
    this.categorieList = document.getElementById("categoryList");
    this.dataService = dataService;
    this.categories = null;
    this.init();
  }

  async init() {
    try {
      this.categories = await dataService.fetchCategories();
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
        class="category-box flex flex-col items-center gap-sm cursor-pointer p-sm"
        style="aspect-ratio: 1 / 1; min-height: 8rem;"
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

const categoryModuleInstance = new CategoryModule(dataService);
export default categoryModuleInstance;
