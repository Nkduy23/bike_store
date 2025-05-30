function lazyLoadImages() {
  const images = document.querySelectorAll("img.lazy");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove("lazy");
        observer.unobserve(img);
      }
    });
  });

  images.forEach((img) => observer.observe(img));
}

export default lazyLoadImages;