class ProductsManager {
  constructor() {
    this.productList = document.getElementById("productList");
    this.apiUrl = "/../src/data/products.json";
    this.currentCategory = "";
    this.visibleProducts = 4;

    this.init();
  }

  async init(category) {
    try {
      await this.fetchProducts();
      this.renderProductsByCategory(category);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  async fetchProducts() {
    const response = await fetch(this.apiUrl);
    if (!response) {
      throw new Error("Network response was not ok");
    }
    this.products = await response.json();
  }

  renderProductsByCategory(category) {
    this.currentCategory = category;
    this.productList.innerHTML = "";
    const filteredProducts = this.products.filter((product) => product.category === category);
    const displayedProducts = filteredProducts.slice(0, this.visibleProducts); // Chỉ lấy 4 sản phẩm đầu

    displayedProducts.forEach((product) => {
      const productItem = document.createElement("div");
      productItem.className = "product-item";
      productItem.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div class="product-name">${product.name}</div>
        <div class="flex items-center justify-center gap-xs">
          ${
            product.priceSale
              ? `
              <div class="product-priceSale">${product.priceSale.toLocaleString()}đ</div>
              <div class="product-priceOld">${product.priceOriginal.toLocaleString()}đ</div>
                `
              : `<div class="product-priceOriginal">${product.priceOriginal.toLocaleString()}đ</div>`
          }
        </div>
      `;
      productItem.addEventListener("click", () => {
        window.location.href = `product-detail.html?id=${product.id}`;
      });
      this.productList.appendChild(productItem);
    });

    // Thêm sự kiện cho nút "Xem thêm"
    const viewMoreButtons = document.querySelectorAll(".view-more");
    viewMoreButtons.forEach((button) => {
      button.addEventListener("click", () => this.loadMoreProducts());
    });
  }

  loadMoreProducts() {
    const filteredProducts = this.products.filter((product) => product.category === this.currentCategory);
    this.visibleProducts += 4; // Tăng số sản phẩm hiển thị thêm 4
    if (this.visibleProducts >= filteredProducts.length) {
      this.visibleProducts = filteredProducts.length; // Giới hạn tối đa
      document.querySelectorAll(".view-more").forEach((button) => (button.style.display = "none")); // Ẩn nút khi hết
    }
    this.renderProductsByCategory(this.currentCategory);
  }
}

export default ProductsManager;
