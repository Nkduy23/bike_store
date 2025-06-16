import BaseService from "./base.service.js";

class AuthService extends BaseService {
  constructor(config = {}) {
    super("users", config);
  }

  async login(email, password) {
    try {
      // Logic login đã được chuyển sang AuthModule để xử lý băm và xác thực
      throw new Error("Login logic moved to AuthModule for hashing and validation.");
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      // Gửi dữ liệu đã băm từ AuthModule
      return this.request("", "POST", userData);
    } catch (error) {
      throw error;
    }
  }
}

export default (config) => new AuthService(config);
