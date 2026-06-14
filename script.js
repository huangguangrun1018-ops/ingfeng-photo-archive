const filterButtons = document.querySelectorAll(".filter-button");
const photoCards = document.querySelectorAll(".photo-card");
const eventSections = document.querySelectorAll(".event-section");
const photoButtons = document.querySelectorAll(".photo-button");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxTitle = lightbox.querySelector("h2");
const lightboxMeta = lightbox.querySelector("p");
const closeButton = document.querySelector(".lightbox-close");
const heroCarousel = document.querySelector("[data-profile-carousel]");
const deferredImages = document.querySelectorAll("img[data-src]");

function shuffleItems(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function setupHeroCarousel() {
  if (!heroCarousel) {
    return;
  }

  const frame = heroCarousel.querySelector(".hero-carousel-frame");
  const caption = heroCarousel.querySelector("figcaption");
  const profileShots = Array.from(document.querySelectorAll(".profile-gallery .profile-shot"));
  const selectedShots = shuffleItems(profileShots).slice(0, 5);

  if (!frame || selectedShots.length === 0) {
    return;
  }

  frame.innerHTML = selectedShots
    .map((button, index) => {
      const image = button.querySelector("img");
      const src = image ? image.dataset.src || image.getAttribute("src") : "";
      const alt = image ? image.getAttribute("alt") : "镜风个人展示";
      const activeClass = index === 0 ? " is-active" : "";
      const sourceAttributes =
        index === 0
          ? `src="${src}" fetchpriority="high"`
          : `src="assets/placeholder.svg" data-carousel-src="${src}"`;

      return `<img class="hero-slide${activeClass}" ${sourceAttributes} alt="${alt}" decoding="async" />`;
    })
    .join("");

  const slides = Array.from(frame.querySelectorAll(".hero-slide"));
  let currentIndex = 0;

  function loadCarouselSlide(slide) {
    const src = slide.dataset.carouselSrc;

    if (!src) {
      return;
    }

    slide.src = src;
    slide.removeAttribute("data-carousel-src");
  }

  function preloadNextSlide() {
    loadCarouselSlide(slides[(currentIndex + 1) % slides.length]);
  }

  if (caption && selectedShots[0]) {
    caption.textContent = selectedShots[0].dataset.title || "个人展示 / 随机轮播";
  }

  if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  window.setTimeout(preloadNextSlide, 1600);

  window.setInterval(() => {
    const nextIndex = (currentIndex + 1) % slides.length;
    const nextSlide = slides[nextIndex];

    loadCarouselSlide(nextSlide);

    const showNextSlide = () => {
      slides[currentIndex].classList.remove("is-active");
      currentIndex = nextIndex;
      nextSlide.classList.add("is-active");

      if (caption && selectedShots[currentIndex]) {
        caption.textContent = selectedShots[currentIndex].dataset.title || "个人展示 / 随机轮播";
      }

      window.setTimeout(preloadNextSlide, 1600);
    };

    if (nextSlide.complete && nextSlide.naturalWidth > 0) {
      showNextSlide();
    } else {
      nextSlide.addEventListener("load", showNextSlide, { once: true });
    }
  }, 3600);
}

setupHeroCarousel();

function loadDeferredImage(image) {
  const src = image.dataset.src;

  if (!src) {
    return;
  }

  image.src = src;
  image.fetchPriority = "low";
  image.removeAttribute("data-src");
}

function setupDeferredImages() {
  if (!("IntersectionObserver" in window)) {
    deferredImages.forEach(loadDeferredImage);
    return;
  }

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        loadDeferredImage(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "700px 0px",
      threshold: 0.01,
    },
  );

  deferredImages.forEach((image) => imageObserver.observe(image));
}

setupDeferredImages();

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    eventSections.forEach((section) => {
      section.classList.toggle("hidden", filter !== "all" && section.dataset.category !== filter);
    });

    photoCards.forEach((card) => {
      card.classList.remove("hidden");
    });
  });
});

photoButtons.forEach((button) => {
  button.addEventListener("click", () => {
    lightboxImage.src = button.dataset.full;
    lightboxImage.alt = button.dataset.title;
    lightboxTitle.textContent = button.dataset.title;
    lightboxMeta.textContent = button.dataset.meta;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  });
});

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.src = "";
  document.body.style.overflow = "";
}

closeButton.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox.hidden) {
    closeLightbox();
  }
});
