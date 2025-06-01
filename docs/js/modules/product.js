class ProductModule {
  constructor(cartManager) {
    this.apiUrl = "http://localhost:3000/products";
    this.products = [];
    this.productLists = [];
    this.visibleProducts = 4;
    this.cartManager = cartManager;
  }

  async init(productLists) {
    try {
      this.productLists = productLists.map((list) => ({
        element: document.getElementById(list.elementId),
        category: list.category,
        visibleCount: this.visibleProducts,
      }));
      await this.fetchProduct();
      this.renderAllProductLists();
      this.addEventListeners();
    } catch (error) {
      console.error("Error initializing products:", error);
    }
  }

  async fetchProduct() {
    const response = await fetch(`${this.apiUrl}?_fields=id,name,image,priceSale,priceOriginal,category`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    this.products = await response.json();
  }

  renderAllProductLists() {
    this.productLists.forEach((list) => {
      const filteredProducts = this.products.filter((p) => p.category === list.category);
      const displayedProducts = filteredProducts.slice(0, list.visibleCount);

      list.element.innerHTML = displayedProducts
        .map(
          (product) => `
    <div 
      class="product-item flex flex-col gap-sm items-center" 
      data-product-id="${product.id}" 
      style="width: 100%; min-height: 28rem; padding: 1rem; box-sizing: border-box;"
    >
      <img 
        data-src="${product.image}" 
        alt="${product.name}" 
        style="width: 100%; aspect-ratio: 3 / 2; object-fit: cover; border-radius: 0.25rem;" 
        class="lazy"
      >
      
      <div 
        class="product-name" 
        style="min-height: 3rem; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin-top: 0.5rem;"
      >
        ${product.name}
      </div>

      ${
        product.priceSale
          ? `
            <div 
              class="product-prices flex gap-sm justify-center" 
              style="min-height: 2rem; margin-top: 0.5rem;"
            >
              <div class="product-priceSale" style="color: red; font-weight: bold;">
                ${product.priceSale.toLocaleString()}đ
              </div>
              <div class="product-priceOld" style="color: gray; text-decoration: line-through;">
                ${product.priceOriginal.toLocaleString()}đ
              </div>
            </div>
          `
          : `
            <div 
              class="product-price" 
              style="min-height: 2rem; color: #333; margin-top: 0.5rem;"
            >
              ${product.priceOriginal.toLocaleString()}đ
            </div>
          `
      }
      <div class="color-selection">
              <div class="color-options" data-product-id="${product.id}">
                ${product.colors.map((color) => `<div class="color-option" data-color="${color}" style="background: ${color};"></div>`).join("")}
      </div>

      </div>
      <button 
        class="add-to-cart" 
        data-product-id="${product.id}" 
        style="min-height: 2.5rem; background-color: #007bff; color: white; border: none; padding: 0.5rem 1rem; cursor: pointer; margin-top: 0.75rem;"
      >
        Mua ngay
      </button>
    </div>
  `
        )
        .join("");
    });
  }

  addEventListeners() {
    const pageDetail = document.querySelectorAll(".product-item");
    pageDetail.forEach((item) => {
      item.addEventListener("click", (e) => {
        if (!e.target.classList.contains("add-to-cart")) {
          const productId = item.getAttribute("data-product-id");
          window.location.href = `detail.html?id=${productId}`;
        }
      });
    });

    const pageCart = document.querySelectorAll(".add-to-cart");
    pageCart.forEach((button) => {
      button.addEventListener("click", async (e) => {
        e.stopPropagation();
        const productId = button.getAttribute("data-product-id");
        const product = this.products.find((p) => p.id == productId);

        const colorOptions = button.parentElement.querySelectorAll(".color-option");
        const selectedColor = Array.from(colorOptions)
          .find((option) => option.classList.contains("active"))
          ?.getAttribute("data-color");

        try {
          if (!selectedColor && product.colors && product.colors.length > 0) {
            alert("Vui lòng chọn màu sắc trước khi thêm vào giỏ hàng!");
            return;
          }
          await this.cartManager.addToCart(product, 1, selectedColor, false);
          window.location.href = "cart.html";
        } catch (error) {
          console.error("Error adding to cart:", error);
          alert("Có lỗi khi thêm vào giỏ hàng. Vui lòng thử lại!");
        }
      });
    });

    const colorOptions = document.querySelectorAll(".color-option");
    colorOptions.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const siblings = option.parentElement.querySelectorAll(".color-option");
        siblings.forEach((o) => o.classList.remove("active"));
        option.classList.add("active");
      });
    });
  }
}

export default ProductModule;
