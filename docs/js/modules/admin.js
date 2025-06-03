// /modules/admin.js
import DataService from "./dataService.js";

class AdminModule {
  constructor(dataService) {
    this.dataService = dataService;
    this.adminContent = document.getElementById("adminContent");
    this.currentTab = "dashboard";
    this.data = {};
  }

  async init() {
    try {
      const [categories, products, shippingPolicies, warrantyPolicies, ratings, cart, reviews, users] = await Promise.all([this.dataService.fetchCategories(), this.dataService.fetchAllProducts(), this.dataService.fetchAllShippingPolicies(), this.dataService.fetchAllWarrantyPolicies(), this.dataService.fetchAllRatings(), this.dataService.fetchCart(), this.dataService.fetchAllReviews(), this.dataService.fetchUsers()]);

      this.data = {
        categories,
        products,
        shippingPolicies,
        warrantyPolicies,
        ratings,
        cart,
        reviews,
        users,
      };

      this.renderAdminLayout();
      this.setupEventListeners();
    } catch (error) {
      console.error("Error initializing admin dashboard:", error);
      this.adminContent.innerHTML = "<h1>Có lỗi khi tải dữ liệu. Vui lòng thử lại!</h1>";
    }
  }

  renderAdminLayout() {
    if (!this.adminContent) return;

    this.adminContent.innerHTML = `
      <div class="admin-container">
        <!-- Sidebar Menu -->
        <div class="sidebar">
          <div class="sidebar-header">
            <h2>🛠️ Admin Panel</h2>
          </div>
          <nav class="sidebar-nav">
            <ul class="nav-menu">
              <li class="nav-item ${this.currentTab === "dashboard" ? "active" : ""}" data-tab="dashboard">
                <i class="icon">📊</i>
                <span>Tổng quan</span>
              </li>
              <li class="nav-item ${this.currentTab === "categories" ? "active" : ""}" data-tab="categories">
                <i class="icon">📂</i>
                <span>Danh mục</span>
                <span class="count">${this.data.categories.length}</span>
              </li>
              <li class="nav-item ${this.currentTab === "products" ? "active" : ""}" data-tab="products">
                <i class="icon">📦</i>
                <span>Sản phẩm</span>
                <span class="count">${this.data.products.length}</span>
              </li>
              <li class="nav-item ${this.currentTab === "users" ? "active" : ""}" data-tab="users">
                <i class="icon">👥</i>
                <span>Người dùng</span>
                <span class="count">${this.data.users.length}</span>
              </li>
              <li class="nav-item ${this.currentTab === "reviews" ? "active" : ""}" data-tab="reviews">
                <i class="icon">⭐</i>
                <span>Đánh giá</span>
                <span class="count">${this.data.reviews.length}</span>
              </li>
              <li class="nav-item ${this.currentTab === "ratings" ? "active" : ""}" data-tab="ratings">
                <i class="icon">🏆</i>
                <span>Xếp hạng</span>
                <span class="count">${this.data.ratings.length}</span>
              </li>
              <li class="nav-item ${this.currentTab === "cart" ? "active" : ""}" data-tab="cart">
                <i class="icon">🛒</i>
                <span>Giỏ hàng</span>
                <span class="count">${this.data.cart.length}</span>
              </li>
              <li class="nav-item ${this.currentTab === "shipping" ? "active" : ""}" data-tab="shipping">
                <i class="icon">🚚</i>
                <span>Vận chuyển</span>
                <span class="count">${this.data.shippingPolicies.length}</span>
              </li>
              <li class="nav-item ${this.currentTab === "warranty" ? "active" : ""}" data-tab="warranty">
                <i class="icon">🛡️</i>
                <span>Bảo hành</span>
                <span class="count">${this.data.warrantyPolicies.length}</span>
              </li>
              <li class="nav-item p-sm"> 
                <i class="icon">🏠</i>
                <a href="./index.html" target="_blank" class = "text-u-none text-white">Trang chủ</a>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <div class="content-header">
            <h1 id="pageTitle">Tổng quan</h1>
            <div class="header-actions">
              <button class="btn btn-primary">+ Thêm mới</button>
              <button class="btn btn-secondary">📤 Xuất dữ liệu</button>
            </div>
          </div>
          <div class="content-body" id="contentBody">
            ${this.renderTabContent(this.currentTab)}
          </div>
        </div>
      </div>
    `;
  }

  renderTabContent(tab) {
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
      case "ratings":
        return this.renderRatingsTab();
      case "cart":
        return this.renderCartTab();
      case "shipping":
        return this.renderShippingTab();
      case "warranty":
        return this.renderWarrantyTab();
      default:
        return this.renderDashboard();
    }
  }

  renderDashboard() {
    const totalProducts = this.data.products.length;
    const totalUsers = this.data.users.length;
    const totalReviews = this.data.reviews.length;
    const totalRevenue = this.data.products.reduce((sum, product) => sum + (product.priceOriginal || 0), 0);

    return `
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <h3>${totalProducts}</h3>
            <p>Sản phẩm</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>${totalUsers}</h3>
            <p>Người dùng</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <h3>${totalReviews}</h3>
            <p>Đánh giá</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <h3>${totalRevenue.toLocaleString()}đ</h3>
            <p>Tổng giá trị</p>
          </div>
        </div>
      </div>
      <div class="recent-activities">
        <h3>Hoạt động gần đây</h3>
        <div class="activity-list">
          <div class="activity-item">
            <span class="activity-icon">📦</span>
            <span class="activity-text">Đã thêm ${this.data.products.slice(-3).length} sản phẩm mới</span>
            <span class="activity-time">Hôm nay</span>
          </div>
          <div class="activity-item">
            <span class="activity-icon">👤</span>
            <span class="activity-text">Có ${this.data.users.slice(-5).length} người dùng mới đăng ký</span>
            <span class="activity-time">Tuần này</span>
          </div>
          <div class="activity-item">
            <span class="activity-icon">⭐</span>
            <span class="activity-text">Nhận được ${this.data.reviews.slice(-10).length} đánh giá mới</span>
            <span class="activity-time">Tháng này</span>
          </div>
        </div>
      </div>
    `;
  }

  renderCategoriesTab() {
    return `
      <div class="data-table-container">
        <div class="table-header">
          <h3>Danh sách danh mục</h3>
          <input type="text" placeholder="🔍 Tìm kiếm danh mục..." class="search-input">
        </div>
        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên danh mục</th>
                <th>Số sản phẩm</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${this.data.categories
                .map(
                  (cat) => `
                <tr>
                  <td>${cat.id || "N/A"}</td>
                  <td>${cat.name || "Chưa có tên"}</td>
                  <td>${this.data.products.filter((p) => p.categoryId === cat.id).length}</td>
                  <td>
                    <button class="btn-action edit">✏️</button>
                    <button class="btn-action delete">🗑️</button>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderProductsTab() {
    return `
      <div class="data-table-container">
        <div class="table-header">
          <h3>Danh sách sản phẩm</h3>
          <input type="text" placeholder="🔍 Tìm kiếm sản phẩm..." class="search-input">
        </div>
        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${this.data.products
                .map(
                  (product) => `
                <tr>
                  <td><img src="${product.image || "/placeholder.jpg"}" alt="${product.name}" class="product-thumb"></td>
                  <td>${product.name}</td>
                  <td>${product.priceOriginal.toLocaleString()}đ</td>
                  <td><span class="status-badge active">Hoạt động</span></td>
                  <td>
                    <button class="btn-action edit">✏️</button>
                    <button class="btn-action delete">🗑️</button>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderUsersTab() {
    return `
      <div class="data-table-container">
        <div class="table-header">
          <h3>Danh sách người dùng</h3>
          <input type="text" placeholder="🔍 Tìm kiếm người dùng..." class="search-input">
        </div>
        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Ngày tham gia</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${this.data.users
                .map(
                  (user) => `
                <tr>
                  <td>${user.id || "N/A"}</td>
                  <td>${user.fullname}</td>
                  <td>${user.email}</td>
                  <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}</td>
                  <td>
                    <button class="btn-action edit">✏️</button>
                    <button class="btn-action delete">🗑️</button>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderReviewsTab() {
    return `
      <div class="reviews-container">
        <div class="table-header">
          <h3>Đánh giá sản phẩm</h3>
          <select class="filter-select">
            <option value="all">Tất cả đánh giá</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>
        <div class="reviews-list">
          ${this.data.reviews
            .map(
              (review) => `
            <div class="review-card">
              <div class="review-header">
                <strong>${review.author}</strong>
                <div class="rating-stars">
                  ${"⭐".repeat(review.rating || 5)}
                </div>
              </div>
              <p class="review-comment">${review.comment || "Chưa có bình luận"}</p>
              <div class="review-actions">
                <button class="btn-action approve">✅ Duyệt</button>
                <button class="btn-action reject">❌ Từ chối</button>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  renderRatingsTab() {
    return `
      <div class="data-table-container">
        <div class="table-header">
          <h3>Xếp hạng sản phẩm</h3>
        </div>
        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Điểm đánh giá</th>
                <th>Số lượt đánh giá</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${this.data.ratings
                .map(
                  (rating) => `
                <tr>
                  <td>${rating.productId}</td>
                  <td>
                    <div class="rating-display">
                      ${"⭐".repeat(Math.floor(rating.rating || 0))}
                      <span class="rating-number">${rating.rating || 0}/5</span>
                    </div>
                  </td>
                  <td>${rating.count || 0} lượt</td>
                  <td>
                    <button class="btn-action edit">✏️</button>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderCartTab() {
    return `
      <div class="data-table-container">
        <div class="table-header">
          <h3>Giỏ hàng người dùng</h3>
        </div>
        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Giá</th>
                <th>Thành tiền</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${this.data.cart
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price ? item.price.toLocaleString() : "N/A"}đ</td>
                  <td>${item.price && item.quantity ? (item.price * item.quantity).toLocaleString() : "N/A"}đ</td>
                  <td>
                    <button class="btn-action delete">🗑️</button>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderShippingTab() {
    return `
      <div class="policies-container">
        <div class="table-header">
          <h3>Chính sách vận chuyển</h3>
        </div>
        <div class="policies-list">
          ${this.data.shippingPolicies
            .map(
              (policy) => `
            <div class="policy-card">
              <div class="policy-header">
                <h4>Chính sách #${policy.id}</h4>
                <div class="policy-actions">
                  <button class="btn-action edit">✏️</button>
                  <button class="btn-action delete">🗑️</button>
                </div>
              </div>
              <div class="policy-details">
                ${policy.details ? policy.details.map((detail) => `<p>• ${detail}</p>`).join("") : "<p>Chưa có chi tiết</p>"}
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  renderWarrantyTab() {
    return `
      <div class="policies-container">
        <div class="table-header">
          <h3>Chính sách bảo hành</h3>
        </div>
        <div class="policies-list">
          ${this.data.warrantyPolicies
            .map(
              (policy) => `
            <div class="policy-card">
              <div class="policy-header">
                <h4>Bảo hành #${policy.id}</h4>
                <div class="policy-actions">
                  <button class="btn-action edit">✏️</button>
                  <button class="btn-action delete">🗑️</button>
                </div>
              </div>
              <div class="policy-details">
                ${policy.details ? policy.details.map((detail) => `<p>• ${detail}</p>`).join("") : "<p>Chưa có chi tiết</p>"}
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        const tab = e.currentTarget.getAttribute("data-tab");
        this.switchTab(tab);
      });
    });
  }

  switchTab(tab) {
    this.currentTab = tab;

    // Update active menu item
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add("active");

    // Update page title
    const titles = {
      dashboard: "Tổng quan",
      categories: "Quản lý danh mục",
      products: "Quản lý sản phẩm",
      users: "Quản lý người dùng",
      reviews: "Quản lý đánh giá",
      ratings: "Xếp hạng sản phẩm",
      cart: "Giỏ hàng",
      shipping: "Chính sách vận chuyển",
      warranty: "Chính sách bảo hành",
    };

    document.getElementById("pageTitle").textContent = titles[tab] || "Trang quản trị";

    // Update content
    document.getElementById("contentBody").innerHTML = this.renderTabContent(tab);
  }
}

const adminInstance = new AdminModule(DataService);
export default adminInstance;
