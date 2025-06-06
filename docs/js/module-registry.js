// exam ModuleRegistry lưu instance này vào this.services với key "productService".
export class ModuleRegistry {
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
      const modules = Array.from(this.modules)
        // destructuring
        .filter(([, { phase: p }]) => p === phase) // Loc theo phase
        .map(([name, { factory }]) => ({ name, factory })); // Tra ra ten + factory

      const phaseResults = await Promise.all(
        modules.map(async ({ name, factory }) => {
          try {
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
