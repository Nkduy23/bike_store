class ProductModule {
  constructor(productService, categoryService, config = {}) {
    this.productService = productService;
    this.categoryService = categoryService;
    this.categoryList = [];
    this.products = [];
    this.visibleProducts = config.visibleProducts || 4;
  }

  async init() {
    try {
      this.categoryList = await this.categoryService.getCategorySections();
      this.products = await this.productService.getHomeProducts();
      this.renderAllProductLists();
      this.addEventListeners();
    } catch (error) {
      console.error("Error initializing products:", error);
    }
  }

  renderAllProductLists() {
    const template = document.getElementById("productTemplate");
    if (!template) {
      console.error('Template with id "productTemplate" not found');
      return;
    }

    this.categoryList.forEach((list) => {
      const filteredProducts = this.products.filter((p) => p.category === list.category);
      const displayedProducts = filteredProducts.slice(0, this.visibleProducts);
      const fragment = document.createDocumentFragment();

      displayedProducts.forEach((product) => {
        const productNode = template.content.cloneNode(true);
        const productItem = productNode.querySelector(".product-item");
        const img = productNode.querySelector("img");
        const productName = productNode.querySelector(".product-name");
        const pricesContainer = productNode.querySelector(".product-prices");
        const priceSale = productNode.querySelector(".product-priceSale");
        const priceOld = productNode.querySelector(".product-priceOld");
        const price = productNode.querySelector(".product-price");
        const labelSale = productNode.querySelector(".product-labelSale");
        const colorOptions = productNode.querySelector(".color-options");
        const addToCart = productNode.querySelector(".add-to-cart");

        productItem.dataset.productId = product.id;

        img.dataset.src = product.image;
        img.alt = product.name;

        productName.textContent = product.name;

        if (product.priceSale) {
          priceSale.textContent = `${product.priceSale.toLocaleString()}đ`;
          priceOld.textContent = `${product.priceOriginal.toLocaleString()}đ`;
          labelSale.textContent = `-${product.discount}%`;
          price.style.display = "none";
        } else {
          price.textContent = `${product.priceOriginal.toLocaleString()}đ`;
          pricesContainer.style.display = "none";
          labelSale.style.display = "none";
        }

        colorOptions.dataset.productId = product.id;
        colorOptions.innerHTML = product.colors.map((color) => `<div class="color-option" data-color="${color}" style="background: ${color};"></div>`).join("");
        addToCart.dataset.productId = product.id;

        fragment.appendChild(productNode);
      });

      list.element.innerHTML = "";
      list.element.appendChild(fragment);
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

export default function productModule(productService, categoryService) {
  return new ProductModule(productService, categoryService);
}
