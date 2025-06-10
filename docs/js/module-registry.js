// exam ModuleRegistry lưu instance này vào this.services với key "productService".
// ModuleRegistry hoạt động như một Dependency Injection Container, lưu trữ tất cả services (productService, categoryService, submenuService) trong một Map.
export default class ModuleRegistry {
  constructor() {
    // Map { "productService" => productServiceInstance }
    // Tại sao dùng Map và phương thức này?
    // Map cung cấp API rõ ràng (has, set, get) và hiệu suất tốt hơn cho việc lưu trữ key-value.
    this.modules = new Map();
    this.services = new Map();
  }

  registerService(name, service) {
    if (this.services.has(name)) {
      console.warn(`Service ${name} already registered. Overwriting`);
    }
    this.services.set(name, service);
  }

  registerModule(name, factory, phase = "main") {
    if (this.modules.has(name)) {
      console.warn(`Module ${name} already registered. Overwriting.`);
    }
    this.modules.set(name, { factory, phase });
  }

  getService(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service;
  }

  async initModules() {
    const results = [];
    const phases = ["early", "main", "late"];

    for (const phase of phases) {
      // console.log(`Processing phase: ${phase}`);

      // Array.from(this.modules) chuyển Map thành mảng các cặp [key, value]:
      const modules = Array.from(this.modules)
        //  Dùng destructuring để bỏ qua key, lấy phase trong value, và đổi tên phase thành p.
        .filter(([, { phase: p }]) => p === phase) // Loc theo phase
        // Trả về object mới: { name: "promo", factory: ... }
        .map(([name, { factory }]) => ({ name, factory })); // Tra ra ten + factory, map chuyển đổi mỗi phần tử thành object <div class=""> name, factory </div>

      // console.log(modules);

      // console.log(
      //   `Modules in ${phase}:`,
      //   modules.map((m) => m.name)
      // );

      const phaseResults = await Promise.all(
        modules.map(async ({ name, factory }) => {
          try {
            // console.log(factory);

            const instance = await factory();
            await instance.init?.();
            return { name, status: "success" };
          } catch (error) {
            console.error(`Module ${name} init failed:`, error);
            return { name, status: "failed", error };
          }
        })
      );
      results.push(...phaseResults);
    }
    return results;
  }
}
