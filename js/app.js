// Strap types: nato (single image), common (split, 5% overlap), steel (split, 8% overlap)
// overlap: how much TOP/BOTTOM overlap the watch area (% of watch height)
// offsetY: vertical shift of both strap parts (% of watch height, positive = down, negative = up)
const STRAP_TYPES = {
  nato: { overlap: 0, offsetY: 0 },
  common: { overlap: 0.06, offsetY: -0.005 },
  steel: { overlap: 0.18, offsetY: 0 }
};

const STRAPS = [
  {
    name: "Black NATO",
    type: "nato",
    image: "assets/straps/nato/black-nato.png"
  },
  {
    name: "Brown NATO",
    type: "nato",
    image: "assets/straps/nato/brown-nato.png"
  },
  {
    name: "Green NATO",
    type: "nato",
    image: "assets/straps/nato/green-nato.png"
  },
  {
    name: "Black Leather",
    type: "common",
    top: "assets/straps/common/black-leather-top.png",
    bottom: "assets/straps/common/black-leather-bottom.png"
  },
  {
    name: "Leather Cream",
    type: "common",
    top: "assets/straps/common/leather-cream-top.png",
    bottom: "assets/straps/common/leather-cream-bottom.png"
  },
  {
    name: "Milano",
    type: "common",
    top: "assets/straps/common/milano-top.png",
    bottom: "assets/straps/common/milano-bottom.png"
  },
  {
    name: "Steel",
    type: "steel",
    top: "assets/straps/steel/steel-top.png",
    bottom: "assets/straps/steel/steel-bottom.png"
  }
];

function getWatchParam() {
  const params = new URLSearchParams(window.location.search);
  const watch = params.get("watch") || "montre1";
  return watch.toLowerCase();
}

function preloadImages(watchName) {
  const srcs = [`assets/watches/${watchName}.png`];
  STRAPS.forEach((s) => {
    if (s.type === "nato") {
      srcs.push(s.image);
    } else {
      srcs.push(s.top);
      srcs.push(s.bottom);
    }
  });
  srcs.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

function createNatoSlide(strap) {
  const assembly = document.createElement("div");
  assembly.className = "assembly assembly--nato";

  const strapImg = document.createElement("img");
  strapImg.className = "assembly__strap";
  strapImg.src = strap.image;
  strapImg.alt = strap.name;

  assembly.appendChild(strapImg);
  return assembly;
}

function createSplitSlide(strap, watchHeight) {
  const { overlap, offsetY } = STRAP_TYPES[strap.type];
  const overlapPx = watchHeight * overlap;
  const offsetPx = watchHeight * offsetY;

  const assembly = document.createElement("div");
  assembly.className = "assembly assembly--split";
  // Shift both strap parts together vertically
  if (offsetPx !== 0) {
    assembly.style.transform = `translateY(${offsetPx}px)`;
  }

  const topImg = document.createElement("img");
  topImg.className = "assembly__top";
  topImg.src = strap.top;
  topImg.alt = `${strap.name} top`;
  topImg.style.marginBottom = `-${overlapPx}px`;

  const spacer = document.createElement("div");
  spacer.className = "assembly__spacer";

  const bottomImg = document.createElement("img");
  bottomImg.className = "assembly__bottom";
  bottomImg.src = strap.bottom;
  bottomImg.alt = `${strap.name} bottom`;
  bottomImg.style.marginTop = `-${overlapPx}px`;

  assembly.appendChild(topImg);
  assembly.appendChild(spacer);
  assembly.appendChild(bottomImg);
  return assembly;
}

function init() {
  const watchName = getWatchParam();
  const watchSrc = `assets/watches/${watchName}.png`;
  preloadImages(watchName);

  const carousel = document.querySelector(".carousel");
  const track = document.querySelector(".carousel__track");
  const nameDisplay = document.querySelector(".strap-selector__name");
  const prevBtn = document.querySelector(".carousel__arrow--prev");
  const nextBtn = document.querySelector(".carousel__arrow--next");

  // Add fixed watch overlay
  const watchImg = document.createElement("img");
  watchImg.className = "carousel__watch";
  watchImg.src = watchSrc;
  watchImg.alt = "Watch";
  carousel.appendChild(watchImg);

  // Wait for watch image to load, then measure its height
  watchImg.addEventListener("load", () => {
    const watchHeight = watchImg.offsetHeight;
    carousel.style.setProperty("--watch-height", watchHeight + "px");
    buildCarousel(watchHeight);
  });

  function buildCarousel(watchHeight) {
    STRAPS.forEach((strap) => {
      const slide = document.createElement("div");
      slide.className = "carousel__slide";

      let assembly;
      if (strap.type === "nato") {
        assembly = createNatoSlide(strap);
      } else {
        assembly = createSplitSlide(strap, watchHeight);
      }

      slide.appendChild(assembly);
      track.appendChild(slide);
    });

    let currentIndex = 0;
    const slides = track.querySelectorAll(".carousel__slide");

    function update() {
      const offset = (1 - currentIndex) * 33.333;
      track.style.transform = `translateX(${offset}%)`;

      slides.forEach((s, i) => {
        s.classList.toggle("carousel__slide--active", i === currentIndex);
      });

      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === STRAPS.length - 1;

      nameDisplay.textContent = STRAPS[currentIndex].name;
    }

    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        update();
      }
    });

    nextBtn.addEventListener("click", () => {
      if (currentIndex < STRAPS.length - 1) {
        currentIndex++;
        update();
      }
    });

    slides.forEach((slide, i) => {
      slide.addEventListener("click", () => {
        currentIndex = i;
        update();
      });
    });

    update();
  }
}

document.addEventListener("DOMContentLoaded", init);
