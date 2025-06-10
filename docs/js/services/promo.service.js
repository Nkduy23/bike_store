import BaseService from "./base.service.js";

class PromoService extends BaseService {
  constructor(config = {}) {
    super("promos", config);
  }

  async getPromos() {
    return this.request("");
  }
}

export default (config) => new PromoService(config);
