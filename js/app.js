const STRAPS = [
  {
    name: "Black NATO",
    type: "nato",
    image: "Black NATO.png"
  },
  {
    name: "Brown NATO",
    type: "nato",
    image: "Brown NATO.png"
  },
  {
    name: "Green NATO",
    type: "nato",
    image: "Green NATO.png"
  },
  {
    name: "Black Leather",
    type: "split",
    top: "Black Leather TOP.png",
    bottom: "Black Leather BOTTOM.png"
  },
  {
    name: "Leather Cream",
    type: "split",
    top: "Leather Cream TOP.png",
    bottom: "Leather Cream BOTTOM.png"
  },
  {
    name: "Milano",
    type: "split",
    top: "Milano TOP.png",
    bottom: "Milano BOTTOM.png"
  },
  {
    name: "Steel",
    type: "split",
    top: "Steel TOP.png",
    bottom: "Steel BOTTOM.png"
  }
];

function getWatchParam() {
  const params = new URLSearchParams(window.location.search);
  const watch = params.get("watch") || "montre1";
  return watch.charAt(0).toUpperCase() + watch.slice(1);
}

function preloadImages(watchName) {
  const srcs = [`assets/${watchName}.png`];
  STRAPS.forEach((s) => {
    if (s.type === "nato") {
      srcs.push(`assets/${s.image}`);
    } else {
      srcs.push(`assets/${s.top}`);
      srcs.push(`assets/${s.bottom}`);
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
  strapImg.src = `assets/${strap.image}`;
  strapImg.alt = strap.name;

  assembly.appendChild(strapImg);
  return assembly;
}

function createSplitSlide(strap) {
  const assembly = document.createElement("div");
  assembly.className = "assembly assembly--split";

  const topImg = document.createElement("img");
  topImg.className = "assembly__top";
  topImg.src = `assets/${strap.top}`;
  topImg.alt = `${strap.name} top`;

  const spacer = document.createElement("div");
  spacer.className = "assembly__spacer";

  const bottomImg = document.createElement("img");
  bottomImg.className = "assembly__bottom";
  bottomImg.src = `assets/${strap.bottom}`;
  bottomImg.alt = `${strap.name} bottom`;

  assembly.appendChild(topImg);
  assembly.appendChild(spacer);
  assembly.appendChild(bottomImg);
  return assembly;
}

function init() {
  const watchName = getWatchParam();
  const watchSrc = `assets/${watchName}.png`;
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
  // and use it to size the spacer in split straps
  watchImg.addEventListener("load", () => {
    const watchHeight = watchImg.offsetHeight;
    carousel.style.setProperty("--watch-height", watchHeight + "px");
    buildCarousel();
  });

  function buildCarousel() {
    // Build slides (straps only, no watch)
    STRAPS.forEach((strap) => {
      const slide = document.createElement("div");
      slide.className = "carousel__slide";

      let assembly;
      if (strap.type === "nato") {
        assembly = createNatoSlide(strap);
      } else {
        assembly = createSplitSlide(strap);
      }

      slide.appendChild(assembly);
      track.appendChild(slide);
    });

    let currentIndex = 0;
    const slides = track.querySelectorAll(".carousel__slide");

    function update() {
      const offset = (currentIndex - 1) * 33.333;
      track.style.transform = `translateX(-${offset}%)`;

      slides.forEach((s, i) => {
        s.classList.toggle("carousel__slide--active", i === currentIndex);
      });

      nameDisplay.textContent = STRAPS[currentIndex].name;
    }

    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + STRAPS.length) % STRAPS.length;
      update();
    });

    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % STRAPS.length;
      update();
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
