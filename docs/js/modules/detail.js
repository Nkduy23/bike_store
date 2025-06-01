class DetailModule {
  constructor(cartManager, dataService) {
    this.dataService = dataService;
    this.product = null;
    this.relatedProducts = [];
    this.reviews = [];
    this.ratings = null;
    this.shippingPolicy = null;
    this.warrantyPolicy = null;
    this.selectedRating = 0;
    this.inputQuantity = 1;
    this.selectedColor = null;
    this.cartManager = cartManager;
  }

  async init() {
    try {
      const productId = new URLSearchParams(window.location.search).get("id");

      if (!productId) {
        throw new Error("Product ID not found in URL");
      }

      this.product = await this.dataService.fetchProduct(productId);

      const [relatedProducts, reviews, ratings, shippingPolicy, warrantyPolicy] = await Promise.all([this.dataService.fetchRelatedProducts(this.product.category, this.product.id), this.dataService.fetchReviews(productId), this.dataService.fetchRatings(productId), this.dataService.fetchShippingPolicy(this.product.shippingPolicyId), this.dataService.fetchWarrantyPolicy(this.product.warrantyPolicyId)]);

      this.relatedProducts = relatedProducts;
      this.reviews = reviews;
      this.ratings = ratings;
      this.shippingPolicy = shippingPolicy;
      this.warrantyPolicy = warrantyPolicy;

      this.renderAll();
      this.addEventListeners();
    } catch (error) {
      console.error("Error initializing detail page:", error);
      alert("Có lỗi khi tải trang chi tiết. Vui lòng thử lại!");
    }
  }

  renderAll() {
    this.renderProductInfo();
    this.imageGallery();
    this.colorSelection();
    this.quantityControls();
    this.tabs();
    this.technicalInfo();
    this.comment();
    this.ShippingAndWarranty();
    this.RatingInput();
    this.RelatedProducts();
  }

  renderProductInfo() {
    document.querySelector(".product-title").textContent = this.product.name;

    if (this.product.priceSale) {
      document.querySelector(".product-priceSale").textContent = this.product.priceSale.toLocaleString("vi-VN") + "₫";
      document.querySelector(".product-priceOriginal").textContent = this.product.priceOriginal.toLocaleString("vi-VN") + "₫";
    } else {
      document.querySelector(".product-priceOriginal").textContent = this.product.priceOriginal.toLocaleString("vi-VN") + "₫";
    }

    document.querySelector(".discount-badge").textContent = `-${this.product.discount}%`;
    const infoValue = document.querySelectorAll(".product-info-grid .info-item .info-value");
    infoValue[0].textContent = this.product.brand;
    infoValue[1].textContent = this.product.size;
    infoValue[2].textContent = this.product.stock > 0 ? `Còn ${this.product.stock} sản phẩm` : "Hết hàng";
    infoValue[3].textContent = this.product.category;

    document.querySelector(".description").innerHTML = `<strong>Mô tả sản phẩm:</strong><br>${this.product.description}`;

    document.querySelector(".add-to-cart").setAttribute("data-id", this.product.id);
  }

  imageGallery() {
    document.querySelector(".product-image").src = this.product.image;
    document.querySelector(".product-image").alt = this.product.name;

    const thumbnail = document.querySelectorAll(".thumbnail-gallery img");
    thumbnail.forEach((thumb, index) => {
      thumb.src = this.product.images[index];
      thumb.alt = `Hình ${index + 1}`;
      thumb.addEventListener("click", () => {
        thumbnail.forEach((t) => t.classList.remove("active"));
        thumb.classList.add("active");
        document.querySelector(".product-image").src = thumb.src;
      });
    });
  }

  colorSelection() {
    const colorOptions = document.querySelectorAll(".color-option");
    colorOptions.forEach((option, index) => {
      option.style.background = this.product.colors[index];
      option.setAttribute("data-color", this.product.colors[index]);
      option.addEventListener("click", () => {
        colorOptions.forEach((o) => o.classList.remove("active"));
        option.classList.add("active");
        this.selectedColor = option.getAttribute("data-color");
      });
    });
  }

  quantityControls() {
    const inputQuantity = document.querySelector(".quantity-input");
    const btnIncrease = document.querySelector(".quantity-increase");
    const btnDecrease = document.querySelector(".quantity-decrease");

    btnDecrease.addEventListener("click", () => {
      const currentValue = parseInt(inputQuantity.value);
      if (currentValue > 1) {
        inputQuantity.value = currentValue - 1;
        this.inputQuantity = Number(inputQuantity.value);
      }
    });

    btnIncrease.addEventListener("click", () => {
      const currentValue = parseInt(inputQuantity.value);
      const maxStock = parseInt(inputQuantity.max);
      if (currentValue < maxStock) {
        inputQuantity.value = currentValue + 1;
        this.inputQuantity = Number(inputQuantity.value);
      }
    });

    inputQuantity.addEventListener("change", () => {
      const value = parseInt(inputQuantity.value);
      const min = parseInt(inputQuantity.min);
      const max = parseInt(inputQuantity.max);

      if (value < min) inputQuantity.value = min;
      if (value > max) inputQuantity.value = max;

      this.inputQuantity = Number(inputQuantity.value);
    });
  }

  tabs() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContent = document.querySelectorAll(".tab-content");

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabId = btn.dataset.tab;

        tabBtns.forEach((b) => b.classList.remove("active"));
        tabContent.forEach((c) => c.classList.remove("active"));

        btn.classList.add("active");
        document.getElementById(tabId)?.classList.add("active");
      });
    });
  }

  technicalInfo() {
    const infoValues = document.querySelectorAll(".tech-table tbody tr td");

    infoValues[0].textContent = this.product.technicalInfo.material;
    infoValues[1].textContent = this.product.technicalInfo.weight;
    infoValues[2].textContent = this.product.technicalInfo.ageRange;
    infoValues[3].textContent = this.product.technicalInfo.wheelSize;
    infoValues[4].textContent = this.product.technicalInfo.brakeType;
    infoValues[5].textContent = this.product.technicalInfo.colors.join(", ");
    infoValues[6].textContent = this.product.technicalInfo.origin;
    infoValues[7].textContent = this.product.technicalInfo.warranty;
  }

  comment() {
    const commentsList = document.querySelector(".comments-list");
    const comments = this.reviews;

    comments.forEach((review) => {
      const commentItem = document.createElement("div");
      commentItem.classList.add("comment-item");

      const header = document.createElement("div");
      header.classList.add("comment-header");

      const author = document.createElement("span");
      author.classList.add("comment-author");
      author.textContent = review.author;

      const date = document.createElement("span");
      date.classList.add("comment-date");
      date.textContent = review.date;

      header.appendChild(author);
      header.appendChild(date);

      const rating = document.createElement("div");
      rating.classList.add("comment-rating");

      for (let i = 0; i < 5; i++) {
        const star = document.createElement("span");
        star.classList.add("star");
        star.textContent = i < review.rating ? "★" : "☆";
        rating.appendChild(star);
      }

      const commentText = document.createElement("div");
      commentText.classList.add("comment-text");
      commentText.textContent = review.comment;

      commentItem.appendChild(header);
      commentItem.appendChild(rating);
      commentItem.appendChild(commentText);

      commentsList.appendChild(commentItem);
    });
  }

  ShippingAndWarranty() {
    const shippingList = document.querySelector(".shipping-list");
    const warrantyList = document.querySelector(".warranty-list");

    if (this.shippingPolicy && this.shippingPolicy.details) {
      this.shippingPolicy.details.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.textContent = item;
        shippingList.appendChild(listItem);
      });
    } else {
      const listItem = document.createElement("li");
      listItem.textContent = "Không có thông tin vận chuyển.";
      shippingList.appendChild(listItem);
    }

    if (this.warrantyPolicy && this.warrantyPolicy.details) {
      this.warrantyPolicy.details.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.textContent = item;
        warrantyList.appendChild(listItem);
      });
    } else {
      const listItem = document.createElement("li");
      listItem.textContent = "Không có thông tin bảo hành.";
      warrantyList.appendChild(listItem);
    }
  }

  RatingInput() {
    const ratingStars = document.querySelectorAll(".rating-star");
    let selectedRating = 0;

    ratingStars.forEach((star) => {
      star.addEventListener("mouseover", () => {
        const rating = parseInt(star.dataset.rating);
        this.highlightStars(rating);
      });

      star.addEventListener("mouseout", () => {
        this.highlightStars(selectedRating);
      });

      star.addEventListener("click", () => {
        selectedRating = parseInt(star.dataset.rating);
        this.highlightStars(selectedRating);
      });
    });
  }

  highlightStars(rating) {
    const ratingStars = document.querySelectorAll(".rating-star");
    console.log(ratingStars);

    ratingStars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add("active");
      } else {
        star.classList.remove("active");
      }
    });
  }

  RelatedProducts() {
    const relatedGrid = document.querySelector(".related-grid");

    this.relatedProducts.forEach((product) => {
      const relatedItem = document.createElement("div");
      relatedItem.classList.add("related-item");
      relatedItem.dataset.productId = product.id;

      const relatedImage = document.createElement("img");
      relatedImage.classList.add("related-image");
      relatedImage.src = product.image;
      relatedImage.alt = product.name;

      const relatedInfo = document.createElement("div");
      relatedInfo.classList.add("related-info");

      const relatedName = document.createElement("div");
      relatedName.classList.add("related-name");
      relatedName.textContent = product.name;

      const relatedPrice = document.createElement("div");
      relatedPrice.classList.add("related-price");

      if (product.priceSale) {
        relatedPrice.innerHTML = `
    <span class="price-sale">${product.priceSale.toLocaleString()}₫</span>
    <span class="price-original">${product.priceOriginal.toLocaleString()}₫</span>
  `;
      } else {
        relatedPrice.textContent = `${product.priceOriginal.toLocaleString()}₫`;
      }

      relatedInfo.appendChild(relatedName);
      relatedInfo.appendChild(relatedPrice);

      relatedItem.appendChild(relatedImage);
      relatedItem.appendChild(relatedInfo);

      relatedGrid.appendChild(relatedItem);
    });
  }

  addEventListeners() {
    const pageCart = document.querySelector(".add-to-cart");
    if (pageCart) {
      pageCart.addEventListener("click", async (e) => {
        e.stopPropagation();
        const product = this.product;
        try {
          if (!this.selectedColor && product.colors && product.colors.length > 0) {
            alert("Vui lòng chọn màu sắc trước khi thêm vào giỏ hàng!");
            return;
          }
          await this.cartManager.addToCart(product, this.inputQuantity, this.selectedColor, true); // isFromDetail = true
          window.location.href = "cart.html";
        } catch (error) {
          console.error("Error adding to cart:", error);
          alert("Có lỗi khi thêm vào giỏ hàng. Vui lòng thử lại!");
        }
      });
    }
  }
}

export default DetailModule;
