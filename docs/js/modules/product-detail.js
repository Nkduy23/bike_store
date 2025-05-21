class ProductDetail {
  constructor() {
    this.apiUrl = "/../src/data/products.json";
    this.productDetail = document.getElementById("productDetail");
    
    // this.init();
  }

  async init() {
    try {
      const productId = new URLSearchParams(window.location.search).get("id");
      await this.fetchProduct(productId);
      this.renderProduct();
    } catch (error) {
      console.error("Error fetching product:", error);
      this.productDetail.innerHTML = "<h1>Sản phẩm không tồn tại</h1>";
    }
  }

  async fetchProduct(id) {
    const response = await fetch(this.apiUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const products = await response.json();
    this.product = products.find((p) => p.id == id);
    console.log(this.product);

    if (!this.product) {
      throw new Error("Product not found");
    }
  }

  renderProduct() {
    // Render thông tin cơ bản
    document.querySelector(".product-title").textContent = this.product.name;
    const mainImage = document.querySelector(".product-image");
    mainImage.src = this.product.image;
    mainImage.alt = this.product.name;
    document.querySelector(".product-price").textContent = this.product.priceSale ? `${this.product.priceSale.toLocaleString()}đ (${this.product.priceOriginal.toLocaleString()}đ)` : `${this.product.price.toLocaleString()}đ`;
    document.querySelector(".product-brand").textContent = this.product.brand;
    document.querySelector(".product-size").textContent = this.product.size;
    document.querySelector(".product-description").textContent = this.product.description;
    document.querySelector(".product-stock").textContent = this.product.stock;

    // Render video
    const videoSource = document.querySelector(".product-video source");
    videoSource.src = this.product.video;
    document.querySelector(".product-video").load();

    // Render ảnh nhỏ
    const thumbnailGallery = document.querySelector(".thumbnail-gallery");
    this.product.images.forEach((imgSrc, index) => {
      const thumbnail = document.createElement("img");
      thumbnail.src = imgSrc;
      thumbnail.alt = `${this.product.name} - Image ${index + 1}`;
      if (index === 0) thumbnail.classList.add("active"); // Ảnh đầu tiên được chọn mặc định
      thumbnail.addEventListener("click", () => {
        mainImage.src = imgSrc; // Cập nhật ảnh chính khi click
        thumbnailGallery.querySelectorAll("img").forEach((img) => img.classList.remove("active"));
        thumbnail.classList.add("active");
      });
      thumbnailGallery.appendChild(thumbnail);
    });

    // Render tùy chọn màu
    const colorOptions = document.querySelector(".color-options");
    this.product.colors.forEach((color, index) => {
      const colorOption = document.createElement("div");
      colorOption.className = "color-option";
      colorOption.style.backgroundColor = this.getColorCode(color); // Gán màu
      if (index === 0) colorOption.classList.add("active"); // Màu đầu tiên được chọn mặc định
      colorOption.addEventListener("click", () => {
        colorOptions.querySelectorAll(".color-option").forEach((opt) => opt.classList.remove("active"));
        colorOption.classList.add("active");
        // Có thể thêm logic để cập nhật thông tin sản phẩm theo màu nếu cần
      });
      colorOptions.appendChild(colorOption);
    });

    // Xử lý số lượng
    const quantityInput = document.querySelector(".quantity-input");
    const decreaseBtn = document.querySelector(".quantity-decrease");
    const increaseBtn = document.querySelector(".quantity-increase");
    decreaseBtn.addEventListener("click", () => {
      let value = parseInt(quantityInput.value);
      if (value > 1) quantityInput.value = value - 1;
    });
    increaseBtn.addEventListener("click", () => {
      let value = parseInt(quantityInput.value);
      if (value < this.product.stock) quantityInput.value = value + 1;
    });
    quantityInput.addEventListener("change", () => {
      let value = parseInt(quantityInput.value);
      if (value < 1) quantityInput.value = 1;
      if (value > this.product.stock) quantityInput.value = this.product.stock;
    });
  }

  // Thêm hàm hỗ trợ để gán màu (có thể tùy chỉnh)
  getColorCode(color) {
    const colorMap = {
      "Xanh dương": "#3498db",
      Hồng: "#ff6f61",
      Đỏ: "#e74c3c",
      Đen: "#333",
      Trắng: "#fff",
      "Xanh lá": "#2ecc71",
      Xám: "#95a5a6",
    };
    return colorMap[color] || "#ccc";
  }
}

export default ProductDetail;
