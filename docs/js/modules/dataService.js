class DataService {
  constructor() {
    this.baseUrl = "http://localhost:3000";
  }

  async fetchProduct(productId) {
    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP console.error status: ${response.status}`);
      }
      const product = await response.json();
      if (!product) {
        throw new Error("Product not found");
      }
      return product;
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  }

  async fetchReviews(productId) {
    try {
      const response = await fetch(`${this.baseUrl}/reviews?productId=${productId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reviews = await response.json();
      return reviews.length ? reviews : [];
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  }

  async fetchRatings(productId) {
    try {
      const response = await fetch(`${this.baseUrl}/ratings?productId=${productId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const ratings = await response.json();
      return ratings.length ? ratings[0] : null; // Giả định chỉ có 1 bản ghi ratings cho mỗi product
    } catch (error) {
      console.error("Error fetching ratings:", error);
      return null;
    }
  }

  async fetchShippingPolicy(policyId) {
    try {
      const response = await fetch(`${this.baseUrl}/shippingPolicies/${policyId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const policy = await response.json();
      return policy;
    } catch (error) {
      console.error("Error fetching shipping policy:", error);
      return null;
    }
  }

  async fetchWarrantyPolicy(policyId) {
    try {
      const response = await fetch(`${this.baseUrl}/warrantyPolicies/${policyId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const policy = await response.json();
      return policy;
    } catch (error) {
      console.error("Error fetching warranty policy:", error);
      return null;
    }
  }

  async fetchRelatedProducts(category, currentProductId) {
    try {
      const response = await fetch(`${this.baseUrl}/products?category=${category}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const products = await response.json();
      return products.filter((p) => p.id !== currentProductId).slice(0, 4); // Lấy 4 sản phẩm liên quan
    } catch (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
  }

  async fetchCart() {
    try {
      const response = await fetch(`${this.baseUrl}/cart`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching cart:", error);
      return [];
    }
  }

  async register(fullname, email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/users?email=${email}`);
      const users = await response.json();
      if (users.length > 0) {
        throw new Error("Email already exists");
      }

      const newUser = { fullname, email, password };
      const postResponse = await fetch(`${this.baseUrl}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await postResponse.json();
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/users?email=${email}`);
      const users = await response.json();
      if (users.length === 0) {
        throw new Error("User not found");
      }

      const user = users[0];
      if (user.password !== password) {
        throw new Error("Invalid password");
      }
      return user;
    } catch (error) {
      // console.error("Error logging in:", error);
      // Nếu lỗi do fetch hoặc lỗi không xác định → trả về thông báo chung
      if (error instanceof TypeError || error.message === "Failed to fetch") {
        throw new Error("Something went wrong. Please try again later.");
      }

      // Nếu lỗi đã rõ ràng như "User not found" hoặc "Invalid password"
      throw error;
    }
  }
}

export default new DataService();
