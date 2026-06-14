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
      const src = image ? image.getAttribute("src") : "";
      const alt = image ? image.getAttribute("alt") : "镜风个人展示";
      const activeClass = index === 0 ? " is-active" : "";
      const priority = index === 0 ? ' fetchpriority="high"' : "";

      return `<img class="hero-slide${activeClass}" src="${src}" alt="${alt}" decoding="async"${priority} />`;
    })
    .join("");

  const slides = Array.from(frame.querySelectorAll(".hero-slide"));
  let currentIndex = 0;

  if (caption && selectedShots[0]) {
    caption.textContent = selectedShots[0].dataset.title || "个人展示 / 随机轮播";
  }

  if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  window.setInterval(() => {
    slides[currentIndex].classList.remove("is-active");
    currentIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].classList.add("is-active");

    if (caption && selectedShots[currentIndex]) {
      caption.textContent = selectedShots[currentIndex].dataset.title || "个人展示 / 随机轮播";
    }
  }, 3600);
}

setupHeroCarousel();

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
