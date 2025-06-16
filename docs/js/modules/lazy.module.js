function lazyLoadImages() {
  const images = document.querySelectorAll("img.lazy");

  if (!images.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          observer.unobserve(img);
        }
      });
    },
    { rootMargin: "200px 0px" } // Preload ảnh 200px trước khi vào viewport
  );

  images.forEach((img) => observer.observe(img));
}

export default lazyLoadImages;
