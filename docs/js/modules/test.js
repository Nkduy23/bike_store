class ProductDetail {
  constructor(cartManager) {
    this.productApiUrl = "http://localhost:3000/products";
    this.commentApiUrl = "http://localhost:3000/comments";
    this.productDetail = document.getElementById("productDetail");
    this.cartManager = cartManager;
    this.products = null;
    this.selectedColor = null;
    this.selectedQuantity = 1;
    this.relatedProducts = [];
  }

  async init() {
    try {
      const productId = new URLSearchParams(window.location.search).get("id");
      await this.fetchProduct(productId);
      this.selectedColor = this.products.colors[0];

      await this.fetchRelatedProducts(this.products.category, this.products.id);
      await this.fetchComments(this.products.id);

      this.renderProductDetail(this.products);
    } catch (error) {
      console.error("Error fetching product:", error);
      this.productDetail.innerHTML = "<h1>Sản phẩm không tồn tại</h1>";
    }
  }

  async fetchProduct(id) {
    const response = await fetch(`${this.productApiUrl}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    this.products = await response.json();
    if (!this.products) {
      throw new Error("Product not found");
    }
  }

  async fetchRelatedProducts(category, currentProductId) {
    try {
      const response = await fetch(this.productApiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const products = await response.json();
      this.relatedProducts = products.filter((p) => p.category === category && p.id != currentProductId).slice(0, 4);
    } catch (error) {
      console.error("Error fetching related products:", error);
      this.relatedProducts = [];
    }
  }

  async fetchComments(productId) {
    try {
      const response = await fetch(`${this.commentApiUrl}?productId=${productId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status} - ${response.statusText}`);
      }
      const comments = await response.json();
      this.products.comments = Array.isArray(comments) ? comments : [];
    } catch (error) {
      console.error("Error fetching comments:", error);
      this.products.comments = [];
    }
  }

  async addComment(productId, comment) {
    try {
      const response = await fetch(`${this.commentApiUrl}?productId=${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(comment),
      });
      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.status} - ${response.statusText}`);
      }
      await this.fetchComments(productId);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  }

  renderProductDetail(product) {
    if (!product) return;

    const getColorCode = (color) => {
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
    };

    this.productDetail.innerHTML = `
      <h2 class="product-title">${product.name}</h2>
      <div class="product-detail-top">
        <div class="main-image-wrapper">
          <img class="product-image" src="${product.image}" alt="${product.name}">
          <div class="thumbnail-gallery">
            ${product.images
              .map(
                (img, index) => `
              <img src="${img}" alt="${product.name} - ${index + 1}" class="${index === 0 ? "active" : ""}">
            `
              )
              .join("")}
            <video class="product-video" controls>
              <source src="${product.video}" type="video/mp4">
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          </div>
        </div>
        <div class="product-info">
          <p class="product-price">
            ${
              product.priceSale
                ? `<span class="product-priceSale">${product.priceSale.toLocaleString()}đ</span> 
                   <span class="product-priceOld">${product.priceOriginal.toLocaleString()}đ</span>`
                : `<span>${product.priceOriginal.toLocaleString()}đ</span>`
            }
          </p>
          <p class="product-brand">Thương hiệu: ${product.brand}</p>
          <p class="product-size">Kích thước: ${product.size}</p>
          <p class="product-stock">Kho: ${product.stock}</p>
          <p class="product-description">${product.description || "Không có mô tả"}</p>

          <div class="color-options">
            ${product.colors
              .map(
                (color, index) => `
              <div class="color-option ${index === 0 ? "active" : ""}" 
                   style="background-color: ${getColorCode(color)}" 
                   data-color="${color}">
              </div>
            `
              )
              .join("")}
          </div>

          <div class="quantity-selector">
            <button class="quantity-decrease">-</button>
            <input type="number" class="quantity-input" value="1" min="1" max="${product.stock}">
            <button class="quantity-increase">+</button>
          </div>

          <button class="add-to-cart" data-product-id="${product.id}">Thêm vào giỏ hàng</button>
        </div>
      </div>

      <!-- Bảng thông tin kỹ thuật -->
      <div class="technical-info">
        <h3>Thông tin kỹ thuật</h3>
        <table>
          <tbody>
            ${
              product.technicalInfo
                ? `
                <tr><td>Chất liệu</td><td>${product.technicalInfo.material || "Không có thông tin"}</td></tr>
                <tr><td>Trọng lượng</td><td>${product.technicalInfo.weight || "Không có thông tin"}</td></tr>
                <tr><td>Độ tuổi phù hợp</td><td>${product.technicalInfo.ageRange || "Không có thông tin"}</td></tr>
                <tr><td>Kích thước bánh xe</td><td>${product.technicalInfo.wheelSize || "Không có thông tin"}</td></tr>
                <tr><td>Loại phanh</td><td>${product.technicalInfo.brakeType || "Không có thông tin"}</td></tr>
              `
                : "<tr><td colspan='2'>Không có thông tin kỹ thuật</td></tr>"
            }
          </tbody>
        </table>
      </div>

      <!-- Bình luận -->
      <div class="comments-section">
        <h3>Bình luận</h3>
        <div class="comment-list" id="commentList">
          ${
            product.comments && product.comments.length > 0
              ? product.comments
                  .map(
                    (comment, index) => `
                    <div class="comment">
                      <p><strong>Người dùng ${index + 1}</strong> (${new Date(comment.timestamp).toLocaleString()}):</p>
                      <p>${comment.text}</p>
                    </div>
                  `
                  )
                  .join("")
              : "<p>Chưa có bình luận nào.</p>"
          }
        </div>
        <div class="comment-form">
          <textarea id="commentInput" placeholder="Viết bình luận của bạn..." rows="3"></textarea>
          <button id="submitComment">Gửi bình luận</button>
        </div>
      </div>

      <!-- Sản phẩm liên quan -->
      <div class="related-products">
        <h3>Sản phẩm liên quan</h3>
        <div class="related-products-list">
          ${
            this.relatedProducts.length > 0
              ? this.relatedProducts
                  .map(
                    (relatedProduct) => `
                    <div class="related-product-item" data-product-id="${relatedProduct.id}">
                      <img src="${relatedProduct.image}" alt="${relatedProduct.name}">
                      <div class="related-product-name">${relatedProduct.name}</div>
                      <div class="related-product-price">
                        ${
                          relatedProduct.priceSale
                            ? `<span class="product-priceSale">${relatedProduct.priceSale.toLocaleString()}đ</span>
                               <span class="product-priceOld">${relatedProduct.priceOriginal.toLocaleString()}đ</span>`
                            : `<span>${relatedProduct.priceOriginal.toLocaleString()}đ</span>`
                        }
                      </div>
                    </div>
                  `
                  )
                  .join("")
              : "<p>Không có sản phẩm liên quan.</p>"
          }
        </div>
      </div>
    `;

    this.addProductDetailEvents(product);
  }

  addProductDetailEvents(product) {
    const thumbnails = document.querySelectorAll(".thumbnail-gallery img");
    const mainImage = document.querySelector(".product-image");
    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener("click", () => {
        thumbnails.forEach((t) => t.classList.remove("active"));
        thumbnail.classList.add("active");
        mainImage.src = thumbnail.src;
      });
    });

    const colorOptions = document.querySelectorAll(".color-option");
    colorOptions.forEach((option) => {
      option.addEventListener("click", () => {
        colorOptions.forEach((opt) => opt.classList.remove("active"));
        option.classList.add("active");
        this.selectedColor = option.getAttribute("data-color");
      });
    });

    const quantityInput = document.querySelector(".quantity-input");
    const decreaseBtn = document.querySelector(".quantity-decrease");
    const increaseBtn = document.querySelector(".quantity-increase");

    decreaseBtn.addEventListener("click", () => {
      let quantity = parseInt(quantityInput.value);
      if (quantity > 1) {
        quantityInput.value = quantity - 1;
        this.selectedQuantity = quantity - 1;
      }
    });

    increaseBtn.addEventListener("click", () => {
      let quantity = parseInt(quantityInput.value);
      if (quantity < product.stock) {
        quantityInput.value = quantity + 1;
        this.selectedQuantity = quantity + 1;
      }
    });

    quantityInput.addEventListener("input", () => {
      let quantity = parseInt(quantityInput.value);
      if (quantity < 1) quantity = 1;
      if (quantity > product.stock) quantity = product.stock;
      quantityInput.value = quantity;
      this.selectedQuantity = quantity;
    });

    const addToCartBtn = document.querySelector(".add-to-cart");
    addToCartBtn.addEventListener("click", async () => {
      try {
        await this.cartManager.addToCart(this.products, this.selectedQuantity, this.selectedColor);
        window.location.href = "cart.html";
      } catch (error) {
        console.error("Failed to add product to cart:", error);
        alert("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!");
      }
    });

    const commentInput = document.getElementById("commentInput");
    const submitCommentBtn = document.getElementById("submitComment");
    submitCommentBtn.addEventListener("click", async () => {
      const commentText = commentInput.value.trim();
      if (commentText) {
        const newComment = {
          id: Date.now().toString(),
          text: commentText,
          timestamp: new Date().toISOString(),
        };
        await this.addComment(product.id, newComment);
        await this.fetchComments(product.id);
        commentInput.value = "";
        this.renderProductDetail(this.products);
      }
    });

    const relatedItems = document.querySelectorAll(".related-product-item");
    relatedItems.forEach((item) => {
      item.addEventListener("click", async () => {
        const productId = item.getAttribute("data-product-id");
        await this.fetchProduct(productId);
        window.location.href = `product-detail.html?id=${productId}`;
      });
    });
  }
}

export default ProductDetail;
