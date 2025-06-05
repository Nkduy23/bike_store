class ProductModule {
  constructor(cartManager, dataServiceManager) {
    this.apiUrl = "http://localhost:3000/products";
    this.products = [];
    this.productLists = [];
    this.visibleProducts = 4;
    this.dataService = dataServiceManager;
    this.cartManager = cartManager;
  }

  async init() {
    try {
      const categorySections = await this.dataService.fetchCategorySections();
      this.productLists = categorySections.map((section) => ({
        element: document.getElementById(section.elementId),
        category: section.category,
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
            class="product-item relative flex flex-col gap-size-1 items-center p-size-1 text-center cursor-pointer" 
            data-product-id="${product.id}">
              <img 
                data-src="${product.image}" 
                alt="${product.name}" 
                class="lazy w-full max-h-200 img-cover rounded-size-1"
              >
              <div class="product-name min-h-size-15">
                ${product.name} 
              </div>

              ${
                product.priceSale
                  ? `
                    <div 
                      class="product-prices flex gap-size-1 justify-center  min-h-size-15" 
                    >
                      <div class="product-priceSale min-h-size-15">
                        ${product.priceSale.toLocaleString()}đ
                      </div>
                      <div class="product-priceOld min-h-size-15">
                        ${product.priceOriginal.toLocaleString()}đ
                      </div>
                    </div>
                    <div class="product-labelSale">-25%</div>
                  `
                  : `
                    <div 
                      class="product-price  min-h-size-15"
                    >
                      ${product.priceOriginal.toLocaleString()}đ
                    </div>
                  `
              }
              <div class="color-selection" style ="min-height: 3rem ">
                <div class="color-options" data-product-id="${product.id}">
                ${product.colors.map((color) => `<div class="color-option" data-color="${color}" style="background: ${color};"></div>`).join("")}
              </div>
              </div>
              <button 
                class="add-to-cart" 
                data-product-id="${product.id}" 
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

export default function productModuleInstance(cartManager, dataServiceManager) {
  return new ProductModule(cartManager, dataServiceManager);
}
