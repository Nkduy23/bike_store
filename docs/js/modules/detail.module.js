// src/modules/product-detail.module.js
class ProductDetailModule {
  constructor(productDetailService, cartService) {
    this.productDetailService = productDetailService;
    this.cartService = cartService;
    this.productId = new URLSearchParams(window.location.search).get("id");
    this.product = null;
    this.policies = null;
  }

  async init() {
    if (!this.productId) {
      console.error("Product ID not found in URL");
      return;
    }
    try {
      this.product = await this.productDetailService.getProductById(this.productId);
      this.policies = await this.productDetailService.getPolicies();
      await this.renderProduct();
      await this.renderReviews();
      await this.renderRelatedProducts();
      this.addEventListeners();
    } catch (error) {
      console.error("Error initializing product detail:", error);
    }
  }

  async renderProduct() {
    if (!this.product) return;

    // Header
    document.querySelector(".product-title").textContent = this.product.name;
    const stars = document.querySelector(".stars");
    stars.innerHTML = this.renderStars(this.product.rating);
    document.querySelector(".rating-text").textContent = `(${this.product.ratingCount} đánh giá)`;

    // Image section
    const mainImage = document.querySelector(".product-image");
    mainImage.src = this.product.image;
    mainImage.alt = this.product.name;

    const thumbnailGallery = document.querySelector("#thumbnailGallery");
    const thumbnailTemplate = document.getElementById("thumbnailTemplate");
    const thumbFragment = document.createDocumentFragment();
    this.product.thumbnails.forEach((thumb, index) => {
      const clone = thumbnailTemplate.content.cloneNode(true);
      const img = clone.querySelector(".thumbnail");
      img.src = thumb;
      img.alt = `${this.product.name} thumbnail ${index + 1}`;
      img.dataset.image = thumb;
      if (index === 0) img.classList.add("active");
      thumbFragment.appendChild(clone);
    });
    thumbnailGallery.innerHTML = "";
    thumbnailGallery.appendChild(thumbFragment);

    // Info section
    document.querySelector(".product-priceSale").textContent = this.product.priceSale ? `${this.product.priceSale.toLocaleString()}đ` : "";
    document.querySelector(".product-priceOriginal").textContent = this.product.priceOriginal.toLocaleString() + "đ";
    document.querySelector(".discount-badge").textContent = this.product.discount ? `-${this.product.discount}%` : "";
    document.querySelector(".brand").textContent = this.product.brand;
    document.querySelector(".size").textContent = this.product.size;
    document.querySelector(".stock-status").textContent = this.product.stockStatus;
    document.querySelector(".category").textContent = this.product.category;
    document.querySelector(".description").innerHTML = this.product.description;

    const colorGrid = document.querySelector("#colorGrid");
    const colorTemplate = document.getElementById("colorOptionTemplate");
    const colorFragment = document.createDocumentFragment();
    this.product.colors.forEach((color, index) => {
      const clone = colorTemplate.content.cloneNode(true);
      const option = clone.querySelector(".color-option");
      option.dataset.color = color;
      option.dataset.image = this.product.colorImages ? this.product.colorImages[color] : this.product.thumbnails[index] || this.product.image;
      option.style.backgroundColor = color.toLowerCase();
      option.title = color;
      if (index === 0) option.classList.add("active");
      colorFragment.appendChild(clone);
    });
    colorGrid.innerHTML = "";
    colorGrid.appendChild(colorFragment);

    // Tech info
    const techTable = document.querySelector("#techTable");
    const techTemplate = document.getElementById("techInfoTemplate");
    const techFragment = document.createDocumentFragment();
    this.product.techInfo.forEach((info) => {
      const clone = techTemplate.content.cloneNode(true);
      clone.querySelector(".tech-label").textContent = info.label;
      clone.querySelector(".tech-value").textContent = info.value;
      techFragment.appendChild(clone);
    });
    techTable.innerHTML = "";
    techTable.appendChild(techFragment);

    // Shipping & warranty
    const shippingList = document.querySelector("#shippingList");
    const warrantyList = document.querySelector("#warrantyList");
    const policyTemplate = document.getElementById("policyTemplate");
    const shippingFragment = document.createDocumentFragment();
    this.policies.shippingPolicies.forEach((policy) => {
      const clone = policyTemplate.content.cloneNode(true);
      clone.querySelector(".policy-item").textContent = policy;
      shippingFragment.appendChild(clone);
    });
    shippingList.innerHTML = "";
    shippingList.appendChild(shippingFragment);

    const warrantyFragment = document.createDocumentFragment();
    this.policies.warrantyPolicies.forEach((policy) => {
      const clone = policyTemplate.content.cloneNode(true);
      clone.querySelector(".policy-item").textContent = policy;
      warrantyFragment.appendChild(clone);
    });
    warrantyList.innerHTML = "";
    warrantyList.appendChild(warrantyFragment);
  }

  async renderReviews() {
    const reviews = await this.productDetailService.getReviewsByProductId(this.productId);
    const commentsList = document.querySelector("#commentsList");
    const commentTemplate = document.getElementById("commentTemplate");
    const commentFragment = document.createDocumentFragment();
    reviews.forEach((review) => {
      const clone = commentTemplate.content.cloneNode(true);
      clone.querySelector(".comment-user").textContent = review.userName;
      clone.querySelector(".comment-date").textContent = review.date;
      clone.querySelector(".comment-rating").innerHTML = this.renderStars(review.rating);
      clone.querySelector(".comment-content").textContent = review.comment;
      commentFragment.appendChild(clone);
    });
    commentsList.innerHTML = "";
    commentsList.appendChild(commentFragment);
  }

  async renderRelatedProducts() {
    const relatedProducts = await this.productDetailService.getRelatedProducts(this.productId);
    const relatedGrid = document.querySelector("#relatedGrid");
    const relatedTemplate = document.getElementById("relatedProductTemplate");
    const relatedFragment = document.createDocumentFragment();
    relatedProducts.forEach((product) => {
      const clone = relatedTemplate.content.cloneNode(true);
      const img = clone.querySelector(".product-image");
      const priceSaleEl = clone.querySelector(".product-priceSale");
      const priceOldEl = clone.querySelector(".product-priceOld");
      const singlePriceEl = clone.querySelector(".product-price"); // fallback nếu chỉ cần 1 giá
      const labelSale = clone.querySelector(".product-labelSale");
      img.src = product.image;
      img.alt = product.name;
      clone.querySelector(".product-name").textContent = product.name;
      if (product.priceSale && product.priceSale < product.priceOriginal) {
        priceSaleEl.textContent = product.priceSale.toLocaleString() + "đ";
        priceOldEl.textContent = product.priceOriginal.toLocaleString() + "đ";
        priceOldEl.style.textDecoration = "line-through";
        priceOldEl.style.opacity = "0.6";
        singlePriceEl.textContent = ""; // không hiển thị single nếu đã có 2 giá
      } else {
        priceSaleEl.textContent = "";
        priceOldEl.textContent = "";
        singlePriceEl.textContent = product.priceOriginal.toLocaleString() + "đ";
      }
      if (labelSale) {
        labelSale.textContent = product.discount + "%";
      }
      relatedFragment.appendChild(clone);
    });
    relatedGrid.innerHTML = "";
    relatedGrid.appendChild(relatedFragment);
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    let stars = "";
    for (let i = 0; i < fullStars; i++) stars += '<span class="star filled">★</span>';
    if (halfStar) stars += '<span class="star half">★</span>';
    for (let i = fullStars + halfStar; i < 5; i++) stars += '<span class="star">★</span>';
    return stars;
  }

  addEventListeners() {
    // Thumbnail click
    const thumbnails = document.querySelectorAll(".thumbnail");
    thumbnails.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        thumbnails.forEach((t) => t.classList.remove("active"));
        thumb.classList.add("active");
        document.querySelector(".product-image").src = thumb.src;
      });
    });

    // Color selection
    const colorOptions = document.querySelectorAll(".color-option");
    const productImage = document.querySelector(".product-image");

    colorOptions.forEach((option) => {
      option.addEventListener("mouseover", () => {
        const imageSrc = option.dataset.image;
        productImage.src = imageSrc;

        // Highlight thumbnail tương ứng
        thumbnails.forEach((t) => t.classList.remove("active"));
        const matchedThumbnail = Array.from(thumbnails).find((t) => t.dataset.image === imageSrc);

        if (matchedThumbnail) matchedThumbnail.classList.add("active");
      });

      option.addEventListener("mouseout", () => {
        const activeColor = document.querySelector(".color-option.active");
        const imageSrc = activeColor.dataset.image;
        productImage.src = imageSrc;

        // Active thumbnail tương ứng
        thumbnails.forEach((t) => t.classList.remove("active"));
        const matchingThumb = Array.from(thumbnails).find((t) => t.src.includes(imageSrc));
        if (matchingThumb) matchingThumb.classList.add("active");
      });

      option.addEventListener("click", () => {
        colorOptions.forEach((o) => o.classList.remove("active"));
        option.classList.add("active");
      });
    });

    // Quantity selector
    const quantityInput = document.querySelector(".quantity-input");
    document.querySelector(".quantity-decrease").addEventListener("click", () => {
      let value = parseInt(quantityInput.value);
      if (value > 1) quantityInput.value = value - 1;
    });
    document.querySelector(".quantity-increase").addEventListener("click", () => {
      let value = parseInt(quantityInput.value);
      if (value < 10) quantityInput.value = value + 1;
    });
    quantityInput.addEventListener("change", () => {
      let value = parseInt(quantityInput.value);
      if (value < 1) quantityInput.value = 1;
      if (value > 10) quantityInput.value = 10;
    });

    // Tabs
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        tabContents.forEach((content) => content.classList.remove("active"));
        button.classList.add("active");
        document.getElementById(button.dataset.tab).classList.add("active");
      });
    });

    // Add to cart
    const addToCartBtn = document.querySelector(".add-to-cart");
    addToCartBtn.addEventListener("click", async () => {
      const quantity = parseInt(quantityInput.value);
      const selectedColor = document.querySelector(".color-option.active")?.dataset.color || null;
      try {
        await this.cartService.addItem(this.product, quantity, selectedColor);
        alert("Đã thêm vào giỏ hàng!");
      } catch (error) {
        alert("Có lỗi khi thêm vào giỏ hàng!");
      }
    });

    // Buy now
    const buyNowBtn = document.querySelector(".buy-now");
    buyNowBtn.addEventListener("click", async () => {
      const quantity = parseInt(quantityInput.value);
      const selectedColor = document.querySelector(".color-option.active")?.dataset.color || null;
      const selectedImage = document.querySelector(".color-option.active")?.dataset.image || this.product.image;
      try {
        await this.cartService.addItem(
          {
            ...this.product,
            image: selectedImage,
            selectedColor,
          },
          quantity,
          selectedColor
        );
        window.location.href = "cart.html";
      } catch (error) {
        alert("Có lỗi khi mua hàng!");
      }
    });

    // Submit review
    const submitReviewBtn = document.querySelector(".submit-review");
    submitReviewBtn.addEventListener("click", async () => {
      const rating = document.querySelector(".rating-star.active")?.dataset.rating || 0;
      const userName = document.querySelector(".form-input").value;
      const comment = document.querySelector(".form-textarea").value;
      if (!rating || !userName || !comment) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }
      try {
        await this.productDetailService.addReview(this.productId, {
          userName,
          rating: parseInt(rating),
          comment,
          date: new Date().toISOString().split("T")[0],
        });
        await this.renderReviews();
        alert("Đánh giá đã được gửi!");
      } catch (error) {
        alert("Có lỗi khi gửi đánh giá!");
      }
    });

    // Rating stars
    const ratingStars = document.querySelectorAll(".rating-star");
    ratingStars.forEach((star) => {
      star.addEventListener("click", () => {
        ratingStars.forEach((s) => s.classList.remove("active"));
        for (let i = 1; i <= star.dataset.rating; i++) {
          document.querySelector(`.rating-star[data-rating="${i}"]`).classList.add("active");
        }
      });
    });
  }
}

export default function productDetailModule(productDetailService, cartService) {
  return new ProductDetailModule(productDetailService, cartService);
}
