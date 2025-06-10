// src/modules/slider.module.js
class SliderModule {
  constructor(sliderService) {
    this.sliderService = sliderService;
    this.sliders = [];
    this.sliderContainer = null;
    this.prevBtn = null;
    this.nextBtn = null;
    this.images = null;
    this.container = document.getElementById("sliderContainer");
    this.currentIndex = 0;
    this.intervalTime = 3000;
    this.intervalId = null;
    this.isDragging = false;
    this.startX = 0;
    this.currentTranslate = 0;
  }

  async init() {
    try {
      this.sliders = await this.sliderService.getSliders();
      if (!this.sliders || this.sliders.length === 0) {
        console.warn("No sliders data available");
        return;
      }
      this.renderSliders();
      this.initializeElements();
      this.startAutoSlide();
      this.addEventListeners();
    } catch (error) {
      console.error("Error initializing slider:", error);
      throw error;
    }
  }

  renderSliders() {
    const template = document.getElementById("sliderTemplate");
    if (!template || !this.container) {
      console.error("Slider template or container not found");
      throw new Error("Slider template or container not found");
    }

    const fragment = document.createDocumentFragment();
    this.sliderContainer = template.content.querySelector(".slider-container").cloneNode(true);
    this.sliders.forEach((slider) => {
      const img = document.createElement("img");
      img.className = "slider-image min-w-full rounded-size-1 cursor-pointer";
      img.src = slider.src;
      img.alt = slider.alt;
      this.sliderContainer.appendChild(img);
    });

    const clone = template.content.cloneNode(true);
    clone.querySelector(".slider-container").replaceWith(this.sliderContainer);
    fragment.appendChild(clone);
    this.container.innerHTML = "";
    this.container.appendChild(fragment);
  }

  initializeElements() {
    this.images = this.container.querySelectorAll(".slider-image");
    this.prevBtn = this.container.querySelector(".slider-prev");
    this.nextBtn = this.container.querySelector(".slider-next");
    if (!this.images.length || !this.prevBtn || !this.nextBtn) {
      console.error("Slider elements not found after render");
      throw new Error("Slider elements not found");
    }
    this.sliderContainer.style.transition = "transform 0.5s ease";
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, this.intervalTime);
  }

  stopAutoSlide() {
    clearInterval(this.intervalId);
  }

  nextSlide() {
    const isLastSlide = this.currentIndex === this.images.length - 1;
    if (isLastSlide) {
      this.sliderContainer.style.transition = "none";
    }
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateSlide();
    if (isLastSlide) {
      setTimeout(() => {
        this.sliderContainer.style.transition = "transform 0.5s ease";
      }, 0);
    }
  }

  prevSlide() {
    const isFirstSlide = this.currentIndex === 0;
    if (isFirstSlide) {
      this.sliderContainer.style.transition = "none";
    }
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.updateSlide();
    if (isFirstSlide) {

      setTimeout(() => {
        this.sliderContainer.style.transition = "transform 0.5s ease";
      }, 0);
    }
  }

  updateSlide() {
    const offset = -this.currentIndex * 100;
    this.currentTranslate = offset;
    this.sliderContainer.style.transform = `translateX(${this.currentTranslate}%)`;
  }

  handleDragStart(e) {
    e.preventDefault();
    this.isDragging = true;
    this.startX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    this.sliderContainer.style.transition = "none";
    this.stopAutoSlide();
  }

  handleDragMove(e) {
    if (!this.isDragging) return;
    const currentX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    const diff = ((currentX - this.startX) / this.sliderContainer.offsetWidth) * 100;
    this.sliderContainer.style.transform = `translateX(${this.currentTranslate + diff}%)`;
  }

  handleDragEnd(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    const currentX = e.type.includes("touch") ? e.changedTouches[0].clientX : e.clientX;
    const diff = ((currentX - this.startX) / this.sliderContainer.offsetWidth) * 100;
    const isLastSlide = this.currentIndex === this.images.length - 1;
    const isFirstSlide = this.currentIndex === 0;

    if (diff > 10 && !isFirstSlide) {
      this.prevSlide();
    } else if (diff < -10 && !isLastSlide) {
      this.nextSlide();
    } else {
      this.sliderContainer.style.transition = "transform 0.5s ease";
      this.updateSlide();
    }
    this.sliderContainer.style.transition = "transform 0.5s ease";
    // this.startAutoSlide();
  }

  addEventListeners() {
    this.prevBtn.addEventListener("click", () => {
      this.stopAutoSlide();
      this.prevSlide();
      this.startAutoSlide();
    });

    this.nextBtn.addEventListener("click", () => {
      this.stopAutoSlide();
      this.nextSlide();
      this.startAutoSlide();
    });

    this.sliderContainer.addEventListener("mousedown", (e) => this.handleDragStart(e));
    this.sliderContainer.addEventListener("mousemove", (e) => this.handleDragMove(e));
    this.sliderContainer.addEventListener("mouseup", (e) => this.handleDragEnd(e));
    this.sliderContainer.addEventListener("mouseleave", (e) => this.handleDragEnd(e));

    this.sliderContainer.addEventListener("touchstart", (e) => this.handleDragStart(e));
    this.sliderContainer.addEventListener("touchmove", (e) => this.handleDragMove(e));
    this.sliderContainer.addEventListener("touchend", (e) => this.handleDragEnd(e));

    this.sliderContainer.addEventListener("mouseenter", () => this.stopAutoSlide());
    this.sliderContainer.addEventListener("mouseleave", () => this.startAutoSlide());
  }
}

export default function sliderModule(sliderService) {
  return new SliderModule(sliderService);
}
