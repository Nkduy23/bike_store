// modules/slider.js
class Slider {
  constructor() {
    this.sliderContainer = document.querySelector(".slider-container");
    this.images = document.querySelectorAll(".slider-image");
    this.prevBtn = document.querySelector(".slider-prev");
    this.nextBtn = document.querySelector(".slider-next");
    this.currentIndex = 0;
    this.intervalTime = 3000;
    this.intervalId = null;
    this.isDragging = false;
    this.startX = 0;
    this.currentTranslate = 0;
    this.init();
  }

  init() {
    this.startAutoSlide();
    this.addEventListeners();
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
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateSlide();
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.updateSlide();
  }

  updateSlide() {
    const offset = -this.currentIndex * 100; // Di chuyển theo phần trăm
    this.currentTranslate = offset; // Lưu vị trí hiện tại
    this.sliderContainer.style.transform = `translateX(${this.currentTranslate}%)`;
  }

  handleDragStart(e) {
    e.preventDefault();
    this.isDragging = true;
    this.startX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    this.sliderContainer.style.transition = "none"; // Tắt transition khi drag
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
    if (diff > 10) this.prevSlide(); // Lướt sang trái (prev)
    else if (diff < -10) this.nextSlide(); // Lướt sang phải (next)
    this.sliderContainer.style.transition = "transform 0.5s ease"; // Bật lại transition
    // this.updateSlide();
    // this.startAutoSlide();
  }

  // Cập nhật addEventListeners()
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

    // Drag trên PC
    this.sliderContainer.addEventListener("mousedown", (e) => this.handleDragStart(e));
    this.sliderContainer.addEventListener("mousemove", (e) => this.handleDragMove(e));
    this.sliderContainer.addEventListener("mouseup", (e) => this.handleDragEnd(e));
    this.sliderContainer.addEventListener("mouseleave", (e) => this.handleDragEnd(e));

    // Touch trên mobile
    this.sliderContainer.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.handleDragStart(e);
    });
    this.sliderContainer.addEventListener("touchmove", (e) => {
      e.preventDefault();
      this.handleDragMove(e);
    });
    this.sliderContainer.addEventListener("touchend", (e) => this.handleDragEnd(e));

    // Hover để dừng/tái khởi động auto slide
    this.sliderContainer.addEventListener("mouseenter", () => {
      this.stopAutoSlide();
    });

    this.sliderContainer.addEventListener("mouseleave", () => {
      this.startAutoSlide();
    });
  }
}

export default Slider;
