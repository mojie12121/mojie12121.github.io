(() => {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  const total = slides.length;
  const slidesViewport = document.querySelector("#slides");
  const prevButton = document.querySelector("#prevButton");
  const nextButton = document.querySelector("#nextButton");
  const slideStatus = document.querySelector("#slideStatus");
  const progressBar = document.querySelector("#progressBar");
  let currentIndex = readIndexFromHash();
  let touchStartX = 0;
  let touchStartY = 0;

  function readIndexFromHash() {
    const match = window.location.hash.match(/^#slide-(\d+)$/);
    if (!match) {
      return 0;
    }

    const index = Number(match[1]) - 1;
    return index >= 0 && index < total ? index : 0;
  }

  function resetContainerScroll() {
    slidesViewport.scrollTop = 0;
    slidesViewport.scrollLeft = 0;
  }

  function setSlide(index, updateHash = true) {
    currentIndex = Math.max(0, Math.min(total - 1, index));

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === currentIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
      slide.inert = !active;

      if (active) {
        slide.scrollTop = 0;
        slide.scrollLeft = 0;
      }
    });

    const page = currentIndex + 1;
    slideStatus.textContent = `${page} / ${total}`;
    progressBar.style.transform = `scaleX(${page / total})`;
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === total - 1;

    resetContainerScroll();
    window.requestAnimationFrame(() => {
      resetContainerScroll();
      slides[currentIndex].scrollTop = 0;
      slides[currentIndex].scrollLeft = 0;
    });
    window.setTimeout(() => {
      resetContainerScroll();
    }, 0);

    if (updateHash) {
      const hash = `#slide-${page}`;
      if (window.location.hash !== hash) {
        window.history.replaceState(null, "", hash);
      }
    }
  }

  function handleKeydown(event) {
    const target = event.target;
    const interactive = target.closest?.("a, button, input, textarea, select, [contenteditable='true']");

    if (interactive && (event.key === " " || event.key === "Enter")) {
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      setSlide(currentIndex + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      setSlide(currentIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setSlide(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setSlide(total - 1);
    }
  }

  function handleTouchEnd(event) {
    if (!event.changedTouches.length) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const isHorizontalSwipe =
      Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35;

    if (isHorizontalSwipe) {
      setSlide(currentIndex + (deltaX < 0 ? 1 : -1));
    }
  }

  prevButton.addEventListener("click", () => setSlide(currentIndex - 1));
  nextButton.addEventListener("click", () => setSlide(currentIndex + 1));
  document.addEventListener("keydown", handleKeydown);
  slidesViewport.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length === 1) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      }
    },
    { passive: true }
  );
  slidesViewport.addEventListener("touchend", handleTouchEnd, { passive: true });
  slidesViewport.addEventListener(
    "scroll",
    () => {
      if (slidesViewport.scrollLeft !== 0 || slidesViewport.scrollTop !== 0) {
        resetContainerScroll();
      }
    },
    { passive: true }
  );

  window.addEventListener("hashchange", () => {
    setSlide(readIndexFromHash(), false);
  });

  setSlide(currentIndex, false);
})();
