const filterButtons = document.querySelectorAll(".filter-button");
const photoCards = document.querySelectorAll(".photo-card");
const eventSections = document.querySelectorAll(".event-section");
const photoButtons = document.querySelectorAll(".photo-button");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxTitle = lightbox.querySelector("h2");
const lightboxMeta = lightbox.querySelector("p");
const closeButton = document.querySelector(".lightbox-close");

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
