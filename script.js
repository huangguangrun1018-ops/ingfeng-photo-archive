const filterButtons = document.querySelectorAll(".filter-button");
const photoCards = document.querySelectorAll(".photo-card");
const eventSections = document.querySelectorAll(".event-section");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxTitle = lightbox.querySelector("h2");
const lightboxMeta = lightbox.querySelector("p");
const closeButton = document.querySelector(".lightbox-close");
const heroCarousel = document.querySelector("[data-profile-carousel]");
const albumPreviewLimit = 10;
const isMobileViewport = window.matchMedia("(max-width: 700px)").matches;
let imageObserver;

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
      const src = image
        ? (isMobileViewport && image.dataset.mobileSrc) || image.dataset.src || image.getAttribute("src")
        : "";
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

function setupAlbumPreviews() {
  eventSections.forEach((section) => {
    const gallery = section.querySelector(".gallery, .photo-grid");

    if (!gallery) {
      return;
    }

    const cards = Array.from(gallery.children).filter((item) => item.classList.contains("photo-card"));
    const overflowCards = cards.slice(albumPreviewLimit);

    if (overflowCards.length === 0) {
      return;
    }

    const galleryId = `${section.id}-gallery`;
    const moreButton = document.createElement("button");

    gallery.id = galleryId;
    section.classList.add("has-album-overflow");
    overflowCards.forEach((card) => card.classList.add("album-overflow-item"));

    moreButton.className = "album-more-button";
    moreButton.type = "button";
    moreButton.setAttribute("aria-controls", galleryId);
    moreButton.setAttribute("aria-expanded", "false");
    moreButton.innerHTML = `<span>查看更多</span><small>剩余 ${overflowCards.length} 张</small>`;

    moreButton.addEventListener("click", () => {
      const isExpanded = moreButton.getAttribute("aria-expanded") === "true";

      overflowCards.forEach((card) => card.classList.toggle("is-revealed", !isExpanded));
      if (isExpanded) {
        scrollToSection(section);
      } else {
        observeDeferredImages(gallery);
      }
      moreButton.setAttribute("aria-expanded", String(!isExpanded));
      moreButton.querySelector("span").textContent = isExpanded ? "查看更多" : "收起照片";
      moreButton.querySelector("small").textContent = isExpanded ? `剩余 ${overflowCards.length} 张` : `已显示全部 ${cards.length} 张`;
    });

    gallery.insertAdjacentElement("afterend", moreButton);
  });
}

setupAlbumPreviews();

function loadDeferredImage(image) {
  const src = (isMobileViewport && image.dataset.mobileSrc) || image.dataset.src;

  if (!src) {
    return;
  }

  image.src = src;
  image.fetchPriority = "low";
  image.removeAttribute("data-src");
  image.removeAttribute("data-mobile-src");
}

function setupDeferredImages() {
  const deferredImages = document.querySelectorAll("img[data-src]");

  if (!("IntersectionObserver" in window)) {
    deferredImages.forEach((image) => {
      if (!image.closest(".album-overflow-item:not(.is-revealed)")) {
        loadDeferredImage(image);
      }
    });
    return;
  }

  imageObserver = new IntersectionObserver(
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
      rootMargin: isMobileViewport ? "120px 0px" : "360px 0px",
      threshold: 0.01,
    },
  );

  observeDeferredImages(document);
}

function observeDeferredImages(root) {
  const deferredImages = root.querySelectorAll("img[data-src]");

  deferredImages.forEach((image) => {
    if (image.closest(".album-overflow-item:not(.is-revealed)")) {
      return;
    }

    if (!imageObserver) {
      loadDeferredImage(image);
      return;
    }

    imageObserver.observe(image);
  });
}

setupDeferredImages();

function scrollToSection(section) {
  if (!section) {
    return;
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      section.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    });
  });
}

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

    scrollToSection(filter === "all" ? document.querySelector(".work-header") : document.getElementById(filter));
  });
});

document.addEventListener("click", (event) => {
  const button = event.target.closest(".photo-button");

  if (!button) {
    return;
  }

  lightboxImage.src = button.dataset.full;
  lightboxImage.alt = button.dataset.title;
  lightboxTitle.textContent = button.dataset.title;
  lightboxMeta.textContent = button.dataset.meta;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
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
