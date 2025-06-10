class PromoModule {
  constructor(promoService) {
    this.promoService = promoService;
    this.promos = [];
    this.container = document.getElementById("promoContainer");
  }

  async init() {
    try {
      this.promos = await this.promoService.getPromos();
      this.renderPromos();
    } catch (error) {
      console.error("Error initializing promo: ", error);
      throw error;
    }
  }

  renderPromos() {
    const template = document.getElementById("promoTemplate");
    if (!template || !this.container) {
      console.error("Promo template or container not found");
      throw new Error("Promo template or container or found");
    }

    const fragment = document.createDocumentFragment();
    this.promos.forEach((promo) => {
      const clone = template.content.cloneNode(true);
      const img = clone.querySelector("img");
      img.src = promo.src;
      img.alt = promo.alt;
      fragment.appendChild(clone);
    });

    this.container.innerHTML = "";
    this.container.appendChild(fragment);
  }
}

export default function promoModule(promoService) {
  return new PromoModule(promoService);
}
