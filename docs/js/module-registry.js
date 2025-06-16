export default class ModuleRegistry {
  constructor() {
    this.modules = new Map();
    this.services = new Map();
    this.middlewares = [];
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

  registerMiddleware(middleware) {
    this.middlewares.push(middleware);
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
        .filter(([, { phase: p }]) => p === phase)
        .map(([name, { factory }]) => ({ name, factory }));

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
