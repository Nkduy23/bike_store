// /modules/dataService.js
class DataService {
  constructor() {
    this.baseUrl = "http://localhost:3000";
  }

  async fetchCategories() {
    try {
      const response = await fetch(`${this.baseUrl}/categories`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const categories = await response.json();
      return categories.length ? categories : [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  async fetchAllProducts() {
    try {
      const response = await fetch(`${this.baseUrl}/products`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const products = await response.json();
      return products.length ? products : [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }
  
  async fetchProducts(productId) {
    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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

  async fetchAllReviews() {
    try {
      const response = await fetch(`${this.baseUrl}/reviews`, {
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

  async fetchAllRatings() {
    try {
      const response = await fetch(`${this.baseUrl}/ratings`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const ratings = await response.json();
      return ratings.length ? ratings : [];
    } catch (error) {
      console.error("Error fetching ratings:", error);
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

  async fetchAllShippingPolicies() {
    try {
      const response = await fetch(`${this.baseUrl}/shippingPolicies`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const shippingPolicies = await response.json();
      return shippingPolicies.length ? shippingPolicies : [];
    } catch (error) {
      console.error("Error fetching shipping policies:", error);
      return [];
    }
  }

  async fetchShippingPolicies(policyId) {
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

  async fetchAllWarrantyPolicies() {
    try {
      const response = await fetch(`${this.baseUrl}/warrantyPolicies`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const warrantyPolicies = await response.json();
      return warrantyPolicies.length ? warrantyPolicies : [];
    } catch (error) {
      console.error("Error fetching warranty policies:", error);
      return [];
    }
  }

  async fetchWarrantyPolicies(policyId) {
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

      if (!postResponse.ok) {
        throw new Error(`HTTP error! status: ${postResponse.status}`);
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
      if (error instanceof TypeError || error.message === "Failed to fetch") {
        throw new Error("Something went wrong. Please try again later.");
      }
      throw error;
    }
  }

  async fetchUsers() {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const users = await response.json();
      return users.length ? users : [];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }
}

export default new DataService();
