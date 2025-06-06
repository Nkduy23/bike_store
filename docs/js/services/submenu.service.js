import BaseService from "./base.service.js";

class SubMenuService extends BaseService {
  constructor(config = {}) {
    super("submenus", config);
  }

  async getSubMenu() {
    return this.request("");
  }
}

export default (config) => new SubMenuService(config);
