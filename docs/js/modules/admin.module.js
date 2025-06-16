class AdminModule {
  constructor(adminService, authGuard) {
    this.adminService = adminService;
    this.authGuard = authGuard;
    this.adminContent = document.getElementById("adminContent");
    this.currentTab = "dashboard";
    this.data = {
      categories: [],
      products: [],
      users: [],
      reviews: [],
      policies: { shippingPolicies: [], warrantyPolicies: [] },
    };
  }

  async init() {
    try {
      const [categories, products, users, reviews, policies] = await Promise.all([this.adminService.getCategories(), this.adminService.getProducts(), this.adminService.getUsers(), this.adminService.getReviews(), this.adminService.getPolicies()]);

      this.data = { categories, products, users, reviews, policies };
      this.checkProfanityInReviews();
      this.renderAdminLayout();
      this.setupEventListeners();
    } catch (error) {
      console.error("Error initializing admin dashboard:", error);
      this.adminContent.innerHTML = "<h1>Có lỗi khi tải dữ liệu. Vui lòng thử lại!</h1>";
    }
  }

  checkProfanityInReviews() {
    const badWords = /thô tục|badword/gi;
    this.data.reviews.forEach((review) => {
      if (!review.status && badWords.test(review.comment)) {
        review.status = "Đang chờ duyệt - Phát hiện từ nhạy cảm";
      }
    });
  }

  renderAdminLayout() {
    const template = document.getElementById("adminLayoutTemplate");
    if (!template) return;

    const clone = template.content.cloneNode(true);
    clone.querySelector('[data-tab="dashboard"]').classList.add("active");
    clone.querySelector("#pageTitle").textContent = "Tổng quan";
    clone.querySelector('[data-count="categories"]').textContent = this.data.categories.length;
    clone.querySelector('[data-count="products"]').textContent = this.data.products.length;
    clone.querySelector('[data-count="users"]').textContent = this.data.users.length;
    clone.querySelector('[data-count="reviews"]').textContent = this.data.reviews.length;
    clone.querySelector('[data-count="policies"]').textContent = this.data.policies.shippingPolicies.length + this.data.policies.warrantyPolicies.length;

    const contentBody = clone.querySelector("#contentBody");
    contentBody.appendChild(this.renderTabContent("dashboard"));

    this.adminContent.innerHTML = "";
    this.adminContent.appendChild(clone);
  }

  renderTabContent(tab) {
    // const fragment = document.createDocumentFragment();
    switch (tab) {
      case "dashboard":
        return this.renderDashboard();
      case "categories":
        return this.renderCategoriesTab();
      case "products":
        return this.renderProductsTab();
      case "users":
        return this.renderUsersTab();
      case "reviews":
        return this.renderReviewsTab();
      case "policies":
        return this.renderPoliciesTab();
      default:
        return this.renderDashboard();
    }
  }

  renderDashboard() {
    const template = document.getElementById("dashboardTemplate");
    const clone = template.content.cloneNode(true);

    clone.querySelector('[data-stat="products"]').textContent = this.data.products.length;
    clone.querySelector('[data-stat="users"]').textContent = this.data.users.length;
    clone.querySelector('[data-stat="reviews"]').textContent = this.data.reviews.length;
    clone.querySelector('[data-stat="revenue"]').textContent = this.data.products.reduce((sum, p) => sum + (p.priceOriginal || 0), 0).toLocaleString() + "đ";

    const activityList = clone.querySelector("#activityList");
    const activityTemplate = document.getElementById("activityItemTemplate");
    [
      { icon: "📦", text: `Đã thêm ${this.data.products.slice(-3).length} sản phẩm mới`, time: "Hôm nay" },
      { icon: "👤", text: `Có ${this.data.users.slice(-5).length} người dùng mới`, time: "Tuần này" },
      { icon: "⭐", text: `Nhận ${this.data.reviews.slice(-10).length} đánh giá mới`, time: "Tháng này" },
    ].forEach((activity) => {
      const activityClone = activityTemplate.content.cloneNode(true);
      activityClone.querySelector(".activity-icon").textContent = activity.icon;
      activityClone.querySelector(".activity-text").textContent = activity.text;
      activityClone.querySelector(".activity-time").textContent = activity.time;
      activityList.appendChild(activityClone);
    });

    return clone;
  }

  renderCategoriesTab() {
    const template = document.getElementById("categoriesTemplate");
    const clone = template.content.cloneNode(true);

    const categoryList = clone.querySelector("#categoryList");
    const rowTemplate = document.getElementById("categoryRowTemplate");
    this.data.categories.forEach((cat) => {
      const row = rowTemplate.content.cloneNode(true);
      row.querySelector(".category-id").textContent = cat.id || "N/A";
      row.querySelector(".category-name").textContent = cat.name || "Chưa có tên";
      row.querySelector(".category-product-count").textContent = this.data.products.filter((p) => p.category === cat.name).length;
      row.querySelector(".edit").dataset.id = cat.id;
      row.querySelector(".delete").dataset.id = cat.id;
      categoryList.appendChild(row);
    });

    return clone;
  }

  renderProductsTab() {
    const template = document.getElementById("productsTemplate");
    const clone = template.content.cloneNode(true);

    const productList = clone.querySelector("#productList");
    const rowTemplate = document.getElementById("productRowTemplate");
    this.data.products.forEach((product) => {
      const row = rowTemplate.content.cloneNode(true);
      const img = row.querySelector(".product-thumb");
      img.classList.add("lazy");
      img.dataset.src = product.image || "/placeholder.jpg";
      img.alt = product.name;
      row.querySelector(".product-name").textContent = product.name;
      row.querySelector(".product-price").textContent = product.priceOriginal;
      row.querySelector(".edit").dataset.id = product.id;
      row.querySelector(".delete").dataset.id = product.id;
      productList.appendChild(row);
    });
    import("./lazy.module.js").then(({ default: lazyLoadImages }) => {
      lazyLoadImages();
    });

    return clone;
  }

  async renderProductForm(action, id) {
    const template = document.getElementById("productFormTemplate");
    if (!template) {
      console.error("Template 'productFormTemplate' not found!");
      return;
    }

    const clone = template.content.cloneNode(true);
    const form = clone.querySelector(".product-form");
    const title = clone.querySelector(".form-title");
    const thumbnailContainer = clone.querySelector("#thumbnailContainer");
    const categorySelect = clone.querySelector("#category");
    const mainImageContainer = clone.querySelector("#mainImageContainer");
    const videoContainer = clone.querySelector("#videoContainer");

    const categories = this.data.categories || JSON.parse(localStorage.getItem("categories")) || [];
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.name;
      option.textContent = cat.name;
      categorySelect.appendChild(option);
    });

    if (action === "edit" && id) {
      const product = await this.adminService.getProduct(id);
      title.textContent = `Sửa sản phẩm: ${product.name}`;
      form.dataset.id = id;
      form.dataset.action = "edit";

      // Điền thông tin
      form.querySelector("#name").value = product.name || "";
      form.querySelector("#rating").value = product.rating || 0;
      form.querySelector("#rating").disabled = true;
      form.querySelector("#ratingCount").value = product.ratingCount || 0;
      form.querySelector("#ratingCount").disabled = true;
      form.querySelector("#priceOriginal").value = product.priceOriginal || 0;
      form.querySelector("#priceSale").value = product.priceSale || "";
      form.querySelector("#discount").value = product.discount || "";
      form.querySelector("#description").value = product.description || "";
      form.querySelector("#brand").value = product.brand || "";
      form.querySelector("#colors").value = product.colors ? product.colors.join("\n") : "";
      form.querySelector("#size").value = product.size || "";
      categorySelect.value = product.category || "";
      form.querySelector("#stockStatus").value = product.stockStatus || "Còn hàng";
      form.querySelector("#techInfo").value = product.techInfo ? JSON.stringify(product.techInfo) : "";

      if (product.image) {
        const imgWrapper = document.createElement("div");
        imgWrapper.classList.add("image-wrapper");
        const img = document.createElement("img");
        img.src = product.image;
        img.alt = `${product.name} main image`;
        img.classList.add("main-image");
        const uploadBtn = document.createElement("button");
        uploadBtn.textContent = "Thay ảnh chính";
        uploadBtn.classList.add("upload-main-image");
        uploadBtn.type = "button";
        imgWrapper.appendChild(img);
        imgWrapper.appendChild(uploadBtn);
        mainImageContainer.appendChild(imgWrapper);
      }

      if (product.video) {
        const videoWrapper = document.createElement("div");
        videoWrapper.classList.add("video-wrapper");
        const video = document.createElement("video");
        video.src = product.video;
        video.controls = true;
        video.classList.add("main-video");
        const uploadBtn = document.createElement("button");
        uploadBtn.textContent = "Thay video";
        uploadBtn.classList.add("upload-main-video");
        uploadBtn.type = "button";
        videoWrapper.appendChild(video);
        videoWrapper.appendChild(uploadBtn);
        videoContainer.appendChild(videoWrapper);
      }

      if (product.thumbnails) {
        product.thumbnails.forEach((thumb, index) => {
          const imgWrapper = document.createElement("div");
          imgWrapper.classList.add("thumbnail-wrapper");
          const img = document.createElement("img");
          img.src = thumb || "";
          img.alt = `${product.name} thumbnail ${index + 1}`;
          img.classList.add("thumbnail");
          const uploadBtn = document.createElement("button");
          uploadBtn.textContent = "Thay ảnh";
          uploadBtn.classList.add("upload-thumbnail");
          uploadBtn.dataset.index = index;
          uploadBtn.type = "button";
          imgWrapper.appendChild(img);
          imgWrapper.appendChild(uploadBtn);
          thumbnailContainer.appendChild(imgWrapper);
        });
      }

      mainImageContainer.querySelectorAll(".upload-main-image").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.showImageUpload("main", product.category, id);
        });
      });
      videoContainer.querySelectorAll(".upload-main-video").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.showVideoUpload("main", product.category);
        });
      });
      thumbnailContainer.querySelectorAll(".upload-thumbnail").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.showImageUpload(btn.dataset.index, product.category, id);
        });
      });
    } else {
      title.textContent = "Thêm sản phẩm mới";
      form.dataset.action = "create";

      const imgWrapper = document.createElement("div");
      imgWrapper.classList.add("image-wrapper");
      const uploadBtn = document.createElement("button");
      uploadBtn.textContent = "Thêm ảnh chính";
      uploadBtn.classList.add("upload-main-image");
      uploadBtn.type = "button";
      imgWrapper.appendChild(uploadBtn);
      mainImageContainer.appendChild(imgWrapper);

      const videoWrapper = document.createElement("div");
      videoWrapper.classList.add("video-wrapper");
      const videoUploadBtn = document.createElement("button");
      videoUploadBtn.textContent = "Thêm video";
      videoUploadBtn.classList.add("upload-main-video");
      videoUploadBtn.type = "button";
      videoWrapper.appendChild(videoUploadBtn);
      videoContainer.appendChild(videoWrapper);
    }

    categorySelect.addEventListener("change", () => {
      thumbnailContainer.innerHTML = "";
      const selectedCategory = categorySelect.value;
      if (selectedCategory && action === "create") {
        this.data.products.forEach((product) => {
          if (product.category === selectedCategory) {
            product.thumbnails?.forEach((thumb, index) => {
              const imgWrapper = document.createElement("div");
              imgWrapper.classList.add("thumbnail-wrapper");
              const img = document.createElement("img");
              img.src = thumb;
              img.alt = `Sample thumbnail ${index + 1}`;
              img.classList.add("thumbnail");
              const uploadBtn = document.createElement("button");
              uploadBtn.textContent = "Thay ảnh";
              uploadBtn.classList.add("upload-thumbnail");
              uploadBtn.dataset.index = index;
              uploadBtn.type = "button";
              imgWrapper.appendChild(img);
              imgWrapper.appendChild(uploadBtn);
              thumbnailContainer.appendChild(imgWrapper);
            });
          }
        });
      }
    });

    const contentBody = document.getElementById("contentBody");
    contentBody.innerHTML = "";
    contentBody.appendChild(clone);

    form.addEventListener("submit", (e) => this.handleProductFormSubmit(e));
  }

  showImageUpload(index, category, productId = null) {
    console.log("showImageUpload", index, category, productId);
    const container = index === "main" ? document.getElementById("mainImageContainer") : document.getElementById("thumbnailContainer");
    if (!container) {
      console.error("Container not found!");
      return;
    }

    const uploadInput = document.createElement("input");
    uploadInput.type = "file";
    uploadInput.accept = "image/*";
    uploadInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category || "default");
        formData.append("index", index === "main" ? "0" : index);
        console.log("FormData entries:", [...formData.entries()]);
        try {
          const response = await fetch("http://localhost:3000/api/upload", {
            method: "POST",
            body: formData,
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const textResponse = await response.text();
          console.log("Raw response:", textResponse);

          const result = JSON.parse(textResponse);
          console.log("Parsed result:", result);

          if (result.success && result.url) {
            const imageUrl = `http://localhost:3000${result.url}?t=${Date.now()}`;
            console.log("New image URL:", imageUrl);

            if (index === "main") {
              const imgWrapper = container.querySelector(".image-wrapper");
              if (imgWrapper) {
                let existingImg = imgWrapper.querySelector("img");
                if (existingImg) {
                  existingImg.src = ""; // Xóa src trước để buộc tải lại
                  existingImg.src = imageUrl;
                  existingImg.onload = () => {
                    console.log("Main image loaded:", imageUrl);
                    existingImg.classList.add("main-image");
                  };
                  existingImg.onerror = () => console.error("Failed to load main image:", imageUrl);
                } else {
                  existingImg = document.createElement("img");
                  existingImg.classList.add("main-image");
                  existingImg.alt = `${document.querySelector("#name")?.value || "product"} main image`;
                  existingImg.src = imageUrl;
                  imgWrapper.innerHTML = "";
                  imgWrapper.appendChild(existingImg);
                }

                let uploadBtn = imgWrapper.querySelector("button.upload-main-image");
                if (!uploadBtn) {
                  uploadBtn = document.createElement("button");
                  uploadBtn.textContent = "Thay ảnh chính";
                  uploadBtn.classList.add("upload-main-image");
                  uploadBtn.type = "button";
                  uploadBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showImageUpload("main", category, productId);
                  });
                  imgWrapper.appendChild(uploadBtn);
                }
              }
              if (productId) {
                const product = this.data.products.find((p) => p.id === productId);
                if (product) {
                  const updatedProduct = { ...product, image: imageUrl }; // Sao chép toàn bộ và cập nhật image
                  product.image = imageUrl; // Cập nhật cục bộ
                  await this.adminService.updateProduct(productId, updatedProduct); // Gửi toàn bộ dữ liệu
                }
              }
            } else {
              const wrappers = container.querySelectorAll(".thumbnail-wrapper");
              const wrapper = wrappers[parseInt(index)];
              if (wrapper) {
                let existingThumb = wrapper.querySelector("img");
                if (existingThumb) {
                  existingThumb.src = ""; // Xóa src trước để buộc tải lại
                  existingThumb.src = imageUrl;
                  existingThumb.onload = () => {
                    console.log("Thumbnail loaded:", imageUrl);
                    existingThumb.classList.add("thumbnail");
                  };
                  existingThumb.onerror = () => console.error("Failed to load thumbnail:", imageUrl);
                } else {
                  existingThumb = document.createElement("img");
                  existingThumb.classList.add("thumbnail");
                  existingThumb.alt = `${document.querySelector("#name")?.value || "product"} thumbnail ${parseInt(index) + 1}`;
                  existingThumb.src = imageUrl;
                  wrapper.innerHTML = "";
                  wrapper.appendChild(existingThumb);
                }

                let uploadBtn = wrapper.querySelector("button.upload-thumbnail");
                if (!uploadBtn) {
                  uploadBtn = document.createElement("button");
                  uploadBtn.textContent = "Thay ảnh";
                  uploadBtn.classList.add("upload-thumbnail");
                  uploadBtn.dataset.index = index;
                  uploadBtn.type = "button";
                  uploadBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showImageUpload(index, category, productId);
                  });
                  wrapper.appendChild(uploadBtn);
                }
              }
              if (productId) {
                const product = this.data.products.find((p) => p.id === productId);
                if (product) {
                  if (!product.thumbnails) product.thumbnails = [];
                  product.thumbnails[parseInt(index)] = imageUrl;
                  const updatedProduct = { ...product, thumbnails: product.thumbnails }; // Sao chép toàn bộ và cập nhật thumbnails
                  await this.adminService.updateProduct(productId, updatedProduct); // Gửi toàn bộ dữ liệu
                }
              }
            }
          } else {
            alert("Upload ảnh thất bại: " + (result.message || "Không nhận được URL từ server"));
          }
        } catch (error) {
          console.error("Upload failed:", error);
          alert(`Upload ảnh thất bại! ${error.message}`);
        }
        uploadInput.remove();
      }
    });
    container.appendChild(uploadInput);
    uploadInput.click();
  }

  showVideoUpload(index, category) {
    const container = document.getElementById("videoContainer");
    if (!container) {
      console.error("Video container not found!");
      return;
    }

    const uploadInput = document.createElement("input");
    uploadInput.type = "file";
    uploadInput.accept = "video/*";
    uploadInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category);
        console.log("Sending category to upload:", category);
        formData.append("index", "video");

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const result = await response.json();
          if (result.success) {
            const newVideo = document.createElement("video");
            newVideo.src = result.url;
            newVideo.controls = true;
            newVideo.classList.add("main-video");
            const videoWrapper = container.querySelector(".video-wrapper");
            if (videoWrapper) {
              videoWrapper.innerHTML = "";
              videoWrapper.appendChild(newVideo);
              const uploadBtn = document.createElement("button");
              uploadBtn.textContent = "Thay video";
              uploadBtn.classList.add("upload-main-video");
              uploadBtn.type = "button";
              uploadBtn.addEventListener("click", () => this.showVideoUpload("main", category));
              videoWrapper.appendChild(uploadBtn);
            }
          } else {
            alert("Upload video thất bại: " + (result.message || "Lỗi không xác định"));
          }
        } catch (error) {
          console.error("Upload failed:", error);
          alert(`Upload video thất bại! ${error.message}`);
        }
        uploadInput.remove();
      }
    });
    container.appendChild(uploadInput);
    uploadInput.click();
  }

  renderUsersTab() {
    const template = document.getElementById("usersTemplate");
    const clone = template.content.cloneNode(true);

    const userList = clone.querySelector("#userList");
    const rowTemplate = document.getElementById("userRowTemplate");
    this.data.users.forEach((user) => {
      const row = rowTemplate.content.cloneNode(true);
      row.querySelector(".user-id").textContent = user.id || "N/A";
      row.querySelector(".user-fullname").textContent = user.fullname || "N/A";
      row.querySelector(".user-email").textContent = user.email || "N/A";
      row.querySelector(".user-createdAt").textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A";
      row.querySelector(".edit").dataset.id = user.id;
      row.querySelector(".delete").dataset.id = user.id;
      userList.appendChild(row);
    });

    return clone;
  }

  renderReviewsTab(filteredReviews = this.data.reviews) {
    const template = document.getElementById("reviewsTemplate");
    if (!template) return document.createDocumentFragment();

    const clone = template.content.cloneNode(true);
    const reviewList = clone.querySelector("#reviewList");
    const cardTemplate = document.getElementById("reviewCardTemplate");
    if (!cardTemplate) return clone;

    filteredReviews.forEach((review) => {
      const card = cardTemplate.content.cloneNode(true);
      card.querySelector(".review-author").textContent = review.author || review.userName || "N/A";
      card.querySelector(".rating-stars").textContent = "⭐".repeat(review.rating || 5);
      card.querySelector(".review-comment").textContent = review.comment || "Chưa có bình luận";
      card.querySelector(".review-status").textContent = review.status || "Đang chờ duyệt";

      if (this.authGuard.isAdmin()) {
        const approveBtn = card.querySelector(".approve");
        const rejectBtn = card.querySelector(".reject");
        approveBtn.dataset.id = review.id;
        rejectBtn.dataset.id = review.id;
        approveBtn.style.display = "inline-block";
        rejectBtn.style.display = "inline-block";
      } else {
        card.querySelector(".review-actions").style.display = "none";
      }
      reviewList.appendChild(card);
    });

    const filterSelect = clone.querySelector(".filter-select");
    filterSelect.addEventListener("change", () => {
      const filter = filterSelect.value;
      let filtered = this.data.reviews;
      if (filter !== "all") {
        filtered = filtered.filter((r) => r.rating === parseInt(filter));
      }
      reviewList.innerHTML = "";
      this.renderReviewsTab(filtered);
    });

    return clone;
  }

  renderPoliciesTab() {
    const template = document.getElementById("policiesTemplate");
    const clone = template.content.cloneNode(true);

    const policyList = clone.querySelector("#policyList");
    const cardTemplate = document.getElementById("policyCardTemplate");
    [
      { type: "shipping", title: "Chính sách vận chuyển", details: this.data.policies.shippingPolicies },
      { type: "warranty", title: "Chính sách bảo hành", details: this.data.policies.warrantyPolicies },
    ].forEach((policy) => {
      const card = cardTemplate.content.cloneNode(true);
      card.querySelector(".policy-title").textContent = policy.title;
      const details = card.querySelector(".policy-details");
      policy.details.forEach((detail) => {
        const p = document.createElement("p");
        p.textContent = `• ${detail}`;
        details.appendChild(p);
      });
      card.querySelector(".edit").dataset.type = policy.type;
      card.querySelector(".delete").dataset.type = policy.type;
      policyList.appendChild(card);
    });

    return clone;
  }

  setupEventListeners() {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        const tab = item.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });

    document.querySelector(".add-new").addEventListener("click", () => {
      const tab = this.currentTab;
      if (tab === "products") {
        this.renderProductForm("create", null);
      } else {
        this.openModal(tab, "create");
      }
    });

    document.querySelectorAll(".search-input").forEach((input) => {
      input.addEventListener("input", (e) => this.handleSearch(e.target.value));
    });

    this.adminContent.addEventListener("click", async (e) => {
      const target = e.target;
      console.log("Click target:", target);
      debugger;
      if (target.classList.contains("edit")) {
        const id = target.dataset.id || target.dataset.type;
        const tab = this.currentTab;
        if (tab === "products") {
          this.renderProductForm("edit", id);
        } else {
          this.openModal(tab, "edit", id);
        }
      } else if (target.classList.contains("delete")) {
        this.handleDelete(target.dataset.id || target.dataset.type);
      } else if (target.classList.contains("approve") || target.classList.contains("reject")) {
        if (this.authGuard.isAdmin()) {
          const id = target.dataset.id;
          const action = target.classList.contains("approve") ? "approve" : "reject";
          await this.handleReviewAction(id, action);
        }
      } else if (target.classList.contains("nav-subitem") && target.dataset.action === "edit-product") {
        const id = target.dataset.id; // Giả định id được gán khi click vào sản phẩm
        this.renderProductForm("edit", id);
      }
    });
  }

  async handleProductFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const tab = form.dataset.tab;
    const action = form.dataset.action;
    const id = form.dataset.id;
    const formData = new FormData(form);
    let data = Object.fromEntries(formData);

    try {
      data.priceOriginal = parseInt(data.priceOriginal);
      data.priceSale = data.priceSale ? parseInt(data.priceSale) : null;
      data.discount = data.discount ? parseInt(data.discount) : null;
      data.rating = parseFloat(data.rating) || 0;
      data.ratingCount = parseInt(data.ratingCount) || 0;
      data.techInfo = data.techInfo ? JSON.parse(data.techInfo) : [];
      data.colors = data.colors ? data.colors.split("\n").filter((c) => c.trim()) : [];

      // Lấy Hình ảnh chính từ DOM
      const mainImage = document.getElementById("mainImageContainer").querySelector(".main-image");
      data.image = mainImage ? mainImage.src : "";

      // Lấy Video từ DOM
      const mainVideo = document.getElementById("videoContainer").querySelector(".main-video");
      data.video = mainVideo ? mainVideo.src : "";

      // Lấy danh sách thumbnails từ DOM
      data.thumbnails = [];
      const thumbnailContainer = document.getElementById("thumbnailContainer");
      thumbnailContainer.querySelectorAll(".thumbnail").forEach((img) => {
        data.thumbnails.push(img.src);
      });

      // Tạo colorImages dựa trên colors và thumbnails
      data.colorImages = {};
      const colors = data.colors || [];
      data.thumbnails.slice(0, colors.length).forEach((thumb, index) => {
        if (colors[index]) data.colorImages[colors[index]] = thumb;
      });

      console.log("Submitting data:", data); // Debug để kiểm tra dữ liệu

      if (action === "create") {
        await this.adminService.createProduct(data);
      } else if (id) {
        await this.adminService.updateProduct(id, data);
      }

      await this.reload();
      alert("Thao tác thành công!");
    } catch (err) {
      console.error("Error saving data:", err);
      alert("Có lỗi xảy ra!");
    }
  }

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add("active");

    const titles = {
      dashboard: "Tổng quan",
      categories: "Quản lý danh mục",
      products: "Quản lý sản phẩm",
      users: "Quản lý người dùng",
      reviews: "Quản lý đánh giá",
      policies: "Quản lý chính sách",
    };
    document.getElementById("pageTitle").textContent = titles[tab] || "Trang quản trị";

    const contentBody = document.getElementById("contentBody");
    contentBody.innerHTML = "";
    contentBody.appendChild(this.renderTabContent(tab));
  }

  handleSearch(query) {
    const lowerQuery = query.toLowerCase();
    const tbody = document.querySelector(`#${this.currentTab}List`);
    if (!tbody) return;

    const items = this.data[this.currentTab].filter((item) => {
      if (this.currentTab === "categories") return item.name.toLowerCase().includes(lowerQuery);
      if (this.currentTab === "products") return item.name.toLowerCase().includes(lowerQuery);
      if (this.currentTab === "users") return item.fullname.toLowerCase().includes(lowerQuery) || item.email.toLowerCase().includes(lowerQuery);
      return false;
    });

    tbody.innerHTML = "";
    const rowTemplate = document.getElementById(`${this.currentTab.slice(0, -1)}RowTemplate`);
    items.forEach((item) => {
      const row = rowTemplate.content.cloneNode(true);
      if (this.currentTab === "categories") {
        row.querySelector(".category-id").textContent = item.id;
        row.querySelector(".category-name").textContent = item.name;
        row.querySelector(".category-product-count").textContent = this.data.products.filter((p) => p.category === item.name).length;
        row.querySelector(".edit").dataset.id = item.id;
        row.querySelector(".delete").dataset.id = item.id;
      } else if (this.currentTab === "products") {
        row.querySelector(".product-thumb").src = item.image;
        row.querySelector(".product-name").textContent = item.name;
        row.querySelector(".product-price").textContent = item.priceOriginal.toLocaleString() + "đ";
        row.querySelector(".edit").dataset.id = item.id;
        row.querySelector(".delete").dataset.id = item.id;
      } else if (this.currentTab === "users") {
        row.querySelector(".user-id").textContent = item.id;
        row.querySelector(".user-fullname").textContent = item.fullname;
        row.querySelector(".user-email").textContent = item.email;
        row.querySelector(".user-createdAt").textContent = new Date(item.createdAt).toLocaleDateString("vi-VN");
        row.querySelector(".edit").dataset.id = item.id;
        row.querySelector(".delete").dataset.id = item.id;
      }
      tbody.appendChild(row);
    });
  }

  filterReviews(rating) {
    const reviewList = document.getElementById("reviewList");
    const cardTemplate = document.getElementById("reviewCardTemplate");
    const filteredReviews = rating === "all" ? this.data.reviews : this.data.reviews.filter((r) => r.rating === parseInt(rating));

    reviewList.innerHTML = "";
    filteredReviews.forEach((review) => {
      const card = cardTemplate.content.cloneNode(true);
      card.querySelector(".review-author").textContent = review.author || review.userName || "N/A";
      card.querySelector(".rating-stars").textContent = "⭐".repeat(review.rating || 5);
      card.querySelector(".review-comment").textContent = review.comment || "Chưa có bình luận";
      card.querySelector(".review-status").textContent = review.status || "Đang chờ duyệt";
      if (this.authGuard.isAdmin()) {
        const approveBtn = card.querySelector(".approve");
        const rejectBtn = card.querySelector(".reject");
        approveBtn.dataset.id = review.id;
        rejectBtn.dataset.id = review.id;
        approveBtn.style.display = "inline-block";
        rejectBtn.style.display = "inline-block";
      } else {
        card.querySelector(".review-actions").style.display = "none";
      }
      reviewList.appendChild(card);
    });
  }

  openModal(tab, action, id) {
    const modalTemplate = document.getElementById("modalTemplate");
    if (!modalTemplate) return;

    const modalClone = modalTemplate.content.cloneNode(true);
    const modal = modalClone.querySelector(".modal");
    const form = modal.querySelector(".modal-form");
    const title = modal.querySelector(".modal-title");

    const isCreate = action === "create";
    title.textContent = isCreate ? `Thêm ${tab.slice(0, -1)} mới` : `Sửa ${tab.slice(0, -1)}`;

    let fields = [];
    if (tab === "categories") {
      fields = [{ label: "Tên danh mục", name: "name", type: "text", required: true }];
    } else if (tab === "products") {
      fields = [
        { label: "Tên sản phẩm", name: "name", type: "text", required: true },
        { label: "Đánh giá", name: "rating", type: "number", step: "0.1", min: "0", max: "5" },
        { label: "Số lượt đánh giá", name: "ratingCount", type: "number" },
        { label: "Hình ảnh chính", name: "image", type: "text" },
        { label: "Hình ảnh phụ (mỗi URL một dòng)", name: "thumbnails", type: "textarea" },
        { label: "Hình ảnh theo màu (JSON)", name: "colorImages", type: "textarea", placeholder: '{"black": "url", "blue": "url"}' },
        { label: "Video", name: "video", type: "text" },
        { label: "Giá gốc", name: "priceOriginal", type: "number", required: true },
        { label: "Giá khuyến mãi", name: "priceSale", type: "number" },
        { label: "Phần trăm giảm giá", name: "discount", type: "number" },
        { label: "Mô tả", name: "description", type: "textarea" },
        { label: "Thương hiệu", name: "brand", type: "text" },
        { label: "Màu sắc (mỗi màu một dòng)", name: "colors", type: "textarea" },
        { label: "Kích thước", name: "size", type: "text" },
        { label: "Danh mục", name: "category", type: "select", options: this.data.categories.map((c) => ({ value: c.name, text: c.name })) },
        {
          label: "Tình trạng kho",
          name: "stockStatus",
          type: "select",
          options: [
            { value: "Còn hàng", text: "Còn hàng" },
            { value: "Hết hàng", text: "Hết hàng" },
          ],
        },
        { label: "Thông tin kỹ thuật (JSON)", name: "techInfo", type: "textarea", placeholder: '[{"label": "Chất liệu", "value": "Hợp kim"}, ...]' },
      ];
    } else if (tab === "users") {
      fields = [
        { label: "Họ tên", name: "fullname", type: "text", required: true },
        { label: "Email", name: "email", type: "email", required: true },
        { label: "Ngày tạo", name: "createdAt", type: "date" },
      ];
    } else if (tab === "reviews") {
      fields = [{}]; // Không cho phép chỉnh sửa review, chỉ duyệt/từ chối
    } else if (tab === "policies") {
      fields = [
        {
          label: "Loại chính sách",
          name: "type",
          type: "select",
          options: [
            { value: "shipping", text: "Vận chuyển" },
            { value: "warranty", text: "Bảo hành" },
          ],
          required: true,
        },
        { label: "Chi tiết (mỗi dòng một chính sách)", name: "details", type: "textarea", required: true },
      ];
    }

    fields.forEach((field) => {
      const div = document.createElement("div");
      div.innerHTML = `
        <label for="${field.name}">${field.label}${field.required ? " *" : ""}</label>
        ${
          field.type === "select"
            ? `
          <select id="${field.name}" name="${field.name}" ${field.required ? "required" : ""}>
            ${field.options.map((opt) => `<option value="${opt.value}">${opt.text}</option>`).join("")}
          </select>
        `
            : field.type === "textarea"
            ? `
          <textarea id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""}></textarea>
        `
            : `
          <input type="${field.type}" id="${field.name}" name="${field.name}" ${field.required ? "required" : ""} ${field.step ? `step="${field.step}"` : ""} ${field.min ? `min="${field.min}"` : ""} ${field.max ? `max="${field.max}"` : ""}>
        `
        }
      `;
      form.appendChild(div);
    });

    form.innerHTML += `
      <div class="actions">
        <button type="submit" class="btn btn-submit">Lưu</button>
        <button type="button" class="btn btn-cancel">Hủy</button>
      </div>
    `;

    if (!isCreate && id) {
      const item = this.data[tab].find((item) => item.id === id) || (tab === "policies" && this.data.policies[id + "Policies"]);
      if (item) {
        fields.forEach((field) => {
          const input = form.querySelector(`#${field.name}`);
          if (field.name === "thumbnails") {
            input.value = item[field.name] ? item[field.name].join("\n") : "";
          } else if (field.name === "colorImages") {
            input.value = item[field.name] ? JSON.stringify(item[field.name]) : "";
          } else if (field.name === "techInfo") {
            input.value = item[field.name] ? JSON.stringify(item[field.name]) : "";
          } else if (field.name === "colors") {
            input.value = item[field.name] ? item[field.name].join("\n") : "";
          } else if (tab === "policies" && field.name === "details") {
            input.value = Array.isArray(item) ? item.join("\n") : "";
          } else {
            input.value = item[field.name] || "";
          }
        });
        form.dataset.id = id;
      }
    } else {
      form.dataset.id = null;
    }

    form.dataset.tab = tab;
    form.dataset.action = action;

    modal.classList.add("active");
    document.body.appendChild(modal);

    modal.querySelector(".modal-close").addEventListener("click", () => modal.remove());
    modal.querySelector(".btn-cancel").addEventListener("click", () => modal.remove());
    form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const tab = form.dataset.tab;
    const action = form.dataset.action;
    const id = form.dataset.id;
    const formData = new FormData(form);
    let data = Object.fromEntries(formData);

    try {
      if (tab === "categories") {
        if (action === "create") {
          await this.adminService.createCategory(data);
        } else {
          await this.adminService.updateCategory(id, data);
        }
      } else if (tab === "products") {
        data.priceOriginal = parseInt(data.priceOriginal);
        data.priceSale = data.priceSale ? parseInt(data.priceSale) : null;
        data.discount = data.discount ? parseInt(data.discount) : null;
        data.rating = parseFloat(data.rating) || 0;
        data.ratingCount = parseInt(data.ratingCount) || 0;
        data.thumbnails = data.thumbnails ? data.thumbnails.split("\n").filter((p) => p.trim()) : [];
        data.colorImages = data.colorImages ? JSON.parse(data.colorImages) : {};
        data.techInfo = data.techInfo ? JSON.parse(data.techInfo) : [];
        data.colors = data.colors ? data.colors.split("\n").filter((c) => c.trim()) : [];

        if (action === "create") {
          await this.adminService.createProduct(data);
        } else {
          await this.adminService.updateProduct(id, data);
        }
      } else if (tab === "users") {
        data.createdAt = data.createdAt || new Date().toISOString();
        if (action === "create") {
          await this.adminService.createUser(data);
        } else {
          await this.adminService.updateUser(id, data);
        }
      } else if (tab === "policies") {
        const policies = { ...this.data.policies };
        policies[`${data.type}Policies`] = data.details.split("\n").filter((p) => p.trim());
        await this.adminService.updatePolicies(policies);
      }

      await this.reload();
      form.closest(".modal").remove();
      alert("Thao tác thành công!");
    } catch (err) {
      console.error("Error saving data:", err);
      alert("Có lỗi xảy ra!");
    }
  }

  async handleDelete(id) {
    if (!confirm("Bạn chắc chắn muốn xóa?")) return;

    try {
      let response;
      if (this.currentTab === "categories") {
        response = await this.adminService.deleteCategory(id);
      } else if (this.currentTab === "products") {
        response = await this.adminService.deleteProduct(id);
      } else if (this.currentTab === "users") {
        response = await this.adminService.deleteUser(id);
      } else if (this.currentTab === "reviews") {
        response = await this.adminService.deleteReview(id);
      } else if (this.currentTab === "policies") {
        const policies = { ...this.data.policies };
        policies[`${id}Policies`] = [];
        response = await this.adminService.updatePolicies(policies);
      }

      alert("Xóa thành công!");
      await this.reload();
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Có lỗi xảy ra: " + (err.message || "Vui lòng thử lại!"));
    }
  }

  async handleReviewAction(id, action) {
    try {
      const review = this.data.reviews.find((r) => r.id === id);
      if (!review) return;

      if (action === "approve") {
        await this.adminService.updateReview(id, { ...review, status: "Đã duyệt" });
      } else if (action === "reject") {
        const reason = prompt("Nhập lý do từ chối:");
        if (reason) {
          await this.adminService.updateReview(id, { ...review, status: `Đã ẩn vì: ${reason}` });
        }
      }

      await this.reload();
    } catch (err) {
      console.error("Error handling review:", err);
      alert("Có lỗi xảy ra!");
    }
  }

  async redirectToProductDetail(action, id) {
    if (action === "edit" && id) {
      const product = await this.adminService.getProduct(id); // Giả định có phương thức này
      const queryParams = new URLSearchParams({
        action: "edit",
        id: id,
        data: JSON.stringify(product),
      }).toString();
      window.location.href = `product-detail.html?${queryParams}`;
    } else if (action === "create") {
      const queryParams = new URLSearchParams({ action: "create" }).toString();
      window.location.href = `product-detail.html?${queryParams}`;
    }
  }

  async reload() {
    this.init();
  }
}

export default function adminModule(adminService, authGuard) {
  return new AdminModule(adminService, authGuard);
}
