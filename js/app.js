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
    image: "assets/straps/nato/black-nato.png",
    preview: "assets/previews/complete-nato-black.png"
  },
  {
    name: "Brown NATO",
    type: "nato",
    image: "assets/straps/nato/brown-nato.png",
    preview: "assets/previews/complete-nato-brown.png"
  },
  {
    name: "Green NATO",
    type: "nato",
    image: "assets/straps/nato/green-nato.png",
    preview: "assets/previews/complete-nato-green.png"
  },
  {
    name: "Black Leather",
    type: "common",
    top: "assets/straps/common/black-leather-top.png",
    bottom: "assets/straps/common/black-leather-bottom.png",
    preview: "assets/previews/complete-black-leather.png"
  },
  {
    name: "Leather Cream",
    type: "common",
    top: "assets/straps/common/leather-cream-top.png",
    bottom: "assets/straps/common/leather-cream-bottom.png",
    preview: "assets/previews/complete-leather-cream.png"
  },
  {
    name: "Milano",
    type: "common",
    top: "assets/straps/common/milano-top.png",
    bottom: "assets/straps/common/milano-bottom.png",
    preview: "assets/previews/complete-milano.png"
  },
  {
    name: "Steel",
    type: "steel",
    top: "assets/straps/steel/steel-top.png",
    bottom: "assets/straps/steel/steel-bottom.png",
    preview: "assets/previews/complete-steel.png"
  }
];

function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    watch: (params.get("watch") || "montre1").toLowerCase(),
    previewMode: params.get("preview") === "true"
  };
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
    if (s.preview) srcs.push(s.preview);
  });
  srcs.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

function createNatoAssembly(strap) {
  const assembly = document.createElement("div");
  assembly.className = "assembly assembly--nato";

  const strapImg = document.createElement("img");
  strapImg.className = "assembly__strap";
  strapImg.src = strap.image;
  strapImg.alt = strap.name;

  assembly.appendChild(strapImg);
  return assembly;
}

function createSplitAssembly(strap, watchHeight) {
  const { overlap, offsetY } = STRAP_TYPES[strap.type];
  const overlapPx = watchHeight * overlap;
  const offsetPx = watchHeight * offsetY;

  const assembly = document.createElement("div");
  assembly.className = "assembly assembly--split";
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

function createPreview(strap) {
  const wrapper = document.createElement("div");
  wrapper.className = "slide__preview";

  const img = document.createElement("img");
  img.src = strap.preview;
  img.alt = strap.name;

  wrapper.appendChild(img);
  return wrapper;
}

function scaleToFit() {
  const selector = document.querySelector(".strap-selector");
  selector.style.zoom = window.innerWidth / 1200;
}

function init() {
  scaleToFit();
  window.addEventListener("resize", scaleToFit);

  const { watch: watchName, previewMode } = getParams();
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

      // Assembly (shown when active / under the watch)
      const assemblyWrapper = document.createElement("div");
      assemblyWrapper.className = "slide__assembly";

      let assembly;
      if (strap.type === "nato") {
        assembly = createNatoAssembly(strap);
      } else {
        assembly = createSplitAssembly(strap, watchHeight);
      }
      assemblyWrapper.appendChild(assembly);
      slide.appendChild(assemblyWrapper);

      // Preview (shown when not active, only in preview mode)
      if (previewMode && strap.preview) {
        slide.appendChild(createPreview(strap));
        slide.classList.add("carousel__slide--has-preview");
      }

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
