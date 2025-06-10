class ProductModule {
  constructor(productService, categoryService, cartService, config = {}) {
    this.productService = productService;
    this.categoryService = categoryService;
    this.cartService = cartService;
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
    const colorTemplate = document.getElementById("colorOptionTemplate");
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

        const colorFragment = document.createDocumentFragment();
        product.colors.forEach((color, index) => {
          const clone = colorTemplate.content.cloneNode(true);
          const option = clone.querySelector(".color-option");
          option.dataset.color = color;
          option.dataset.image = product.colorImages ? product.colorImages[color] : product.thumbnails[index] || product.image;
          option.style.backgroundColor = color.toLowerCase();
          if (index === 0) option.classList.add("active");
          colorFragment.appendChild(clone);
        });
        productItem.dataset.defaultColor = product.colors[0];
        colorOptions.innerHTML = "";
        colorOptions.appendChild(colorFragment);

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
        if (!e.target.classList.contains("add-to-cart") && !e.target.classList.contains("color-option")) {
          const productId = item.getAttribute("data-product-id");
          window.location.href = `detail.html?id=${productId}`;
        }
      });
    });

    const colorOptions = document.querySelectorAll(".color-option");

    colorOptions.forEach((option) => {
      option.addEventListener("mouseover", () => {
        const productItem = option.closest(".product-item");
        const img = productItem.querySelector("img");

        img.src = option.dataset.image;

        const currentActiveColor = productItem.querySelector(".color-option.active");
        if (currentActiveColor) currentActiveColor.classList.remove("active");
        option.classList.add("active");
      });

      option.addEventListener("mouseout", () => {
        const productItem = option.closest(".product-item");
        const img = productItem.querySelector("img");

        const defaultColor = productItem.dataset.defaultColor;
        const defaultOption = Array.from(productItem.querySelectorAll(".color-option")).find((opt) => opt.dataset.color === defaultColor);

        if (defaultOption) {
          img.src = defaultOption.dataset.image;
          defaultOption.classList.add("active");
        }

        // Bỏ active của màu vừa hover
        if (option.dataset.color !== defaultColor) {
          option.classList.remove("active");
        }
      });

      option.addEventListener("click", () => {
        const productItem = option.closest(".product-item");
        const colors = productItem.querySelectorAll(".color-option");
        // Cập nhật class active
        colors.forEach((c) => c.classList.remove("active"));
        option.classList.add("active");
        productItem.dataset.defaultColor = option.dataset.color;
      });
    });

    const addToCartButtons = document.querySelectorAll(".add-to-cart");
    addToCartButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const productId = button.dataset.productId;
        const product = this.products.find((p) => p.id === productId);
        const productItem = button.closest(".product-item");
        const selectedColor = productItem.querySelector(".color-option.active")?.dataset.color || null;
        const selectedImage = productItem.querySelector(".color-option.active")?.dataset.image || product.image;

        try {
          await this.cartService.addItem(
            {
              ...product,
              image: selectedImage,
              selectedColor,
            },
            1,
            selectedColor
          );
          alert("Đã thêm vào giỏ hàng!");
        } catch (error) {
          alert("Có lỗi khi thêm vào giỏ hàng!");
        }
      });
    });
  }
}

export default function productModule(productService, categoryService, cartService) {
  return new ProductModule(productService, categoryService, cartService);
}
