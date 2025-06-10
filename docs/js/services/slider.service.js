import BaseService from "./base.service.js";

class SliderService extends BaseService {
  constructor(config = {}) {
    super("sliders", config);
  }

  async getSliders() {
    return this.request("");
  }
}

export default (config) => new SliderService(config);
