export default class BaseService {
  constructor(resource, config = {}) {
    this.baseUrl = config.apiBaseUrl || "http://localhost:3000";
    this.resource = resource;
  }

  async request(endpoint, method = "GET", data = null, full = false) {
    const url = full ? `${this.baseUrl}${endpoint}` : `${this.baseUrl}/${this.resource}${endpoint}`;

    const options = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error in ${method}${endpoint}:`, error);
      throw error;
    }
  }

  async get(queryParams = "") {
    return this.request(queryParams ? `?${queryParams}` : "");
  }
}
