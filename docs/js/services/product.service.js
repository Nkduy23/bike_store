import BaseService from "./base.service.js";

class ProductService extends BaseService {
  constructor(config = {}) {
    super("products", config);
  }

  async getHomeProducts() {
    return this.get(`_fields=id,name,image,priceSale,discount,priceOriginal,colors,colorImages,category`);
  }

  async getProductId(id) {
    return this.get(`${id}`);
  }

  async getAllProducts() {
    return this.request("");
  }
}
// Tên createProductService là do bạn đặt khi import, nhưng nó đại diện cho hàm (config) => new ProductService(config).
// factory function:
// Factory function export default (config) => new ProductService(config) cho phép tạo instance động, thay vì singleton cố định, hỗ trợ cấu hình khác nhau.
export default (config) => new ProductService(config);

// Trong product.service.js, export default (config) => new ProductService(config) định nghĩa một hàm để tạo instance của ProductService.
// Khi bạn import và gọi createProductService({ apiBaseUrl }), bạn thực chất đang gọi hàm (config) => new ProductService(config), dẫn đến việc tạo instance mới của ProductService.
// Thay vì export instance cố định (new ProductService()), factory function cho phép bạn tạo instance động với config khác nhau.
// Điều này hỗ trợ:
// Tùy chỉnh apiBaseUrl (ví dụ: dev, production).
// Tái sử dụng ProductService với các cấu hình khác nhau trong các ngữ cảnh.
