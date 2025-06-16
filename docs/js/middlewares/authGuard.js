class AuthGuard {
  constructor() {
    this.authenticated = false;
    this.user = null;
    this.loadUser();
  }

  loadUser() {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        this.user = JSON.parse(userData);
        this.authenticated = true;
      }
    } catch (error) {
      console.warn("Lỗi khi load user từ localStorage", error);
    }
  }

  checkAuth({ redirect = false, silent = false } = {}) {
    if (!this.authenticated) {
      if (!silent && redirect) {
        alert("Vui lòng đăng nhập trước!");
        window.location.href = "./auth.html";
      }
      return false;
    }
    return true;
  }

  protectRoute({ redirect = true } = {}) {
    return (next) => {
      return async (...args) => {
        const allowed = this.checkAuth({ redirect });
        if (allowed) {
          return await next(...args);
        }
        return null;
      };
    };
  }

  logout() {
    this.authenticated = false;
    this.user = null;
    localStorage.removeItem("user");
    window.location.href = "./auth.html";
  }

  getUserRole() {
    return this.user?.role || "user";
  }

  isAdmin() {
    return this.getUserRole() === "admin";
  }
}

export default () => new AuthGuard();
