// Slider elements
const slider = document.querySelector('[cs-el="slider"]');
const slidesWrap = slider.querySelector('[cs-el="slides"]');
const slides = slidesWrap.querySelectorAll('[cs-el="slide"]');
const prevBtn = slider.querySelector('[cs-el="sliderNavPrev"]');
const nextBtn = slider.querySelector('[cs-el="sliderNavNext"]');
const cover = slider.querySelector('[cs-el="sliderCover"]');
const startBtn = slider.querySelector('[cs-el="sliderStartBtn"]');

// Slider settings
const settings = {
  duration: 1,
  slideSpacing: 100, // percentage
  autoplayDelay: 4,
  ease: 'power2.inOut',
  autoplay: true,
  transitionDuration: 1,
  showIndicators: true,
  showNavigation: true,
  coverTransitionDuration: 1,
};

// State variables
let currentSlide = 0;
let isAnimating = false;
let autoplayInterval;
let indicators;

// Initialize slider
function initSlider() {
  // Create indicators only if enabled
  if (settings.showIndicators) {
    createIndicators();
  }

  // Set initial positions
  gsap.set(slides, {
    xPercent: (i) => i * settings.slideSpacing,
  });

  // Setup click handlers if navigation is enabled
  if (settings.showNavigation) {
    nextBtn.addEventListener('click', () => !isAnimating && goToSlide(currentSlide + 1));
    prevBtn.addEventListener('click', () => !isAnimating && goToSlide(currentSlide - 1));
  } else {
    // Hide navigation buttons
    nextBtn.style.display = 'none';
    prevBtn.style.display = 'none';
  }

  startBtn.addEventListener('click', startSlider);

  // Setup indicators if enabled
  if (settings.showIndicators) {
    indicators.forEach((indicator, i) => {
      indicator.addEventListener('click', () => !isAnimating && goToSlide(i));
    });
  }
}

// Add new function to create indicators
function createIndicators() {
  const indicatorWrapper = slider.querySelector('[cs-el="sliderIndicators"]');
  indicatorWrapper.innerHTML = '';

  slides.forEach(() => {
    const indicator = document.createElement('div');
    indicator.setAttribute('cs-el', 'sliderIndicator');

    const inner = document.createElement('div');
    inner.setAttribute('cs-el', 'sliderIndicatorInner');
    inner.style = '';

    indicator.appendChild(inner);
    indicatorWrapper.appendChild(indicator);
  });

  indicators = slider.querySelectorAll('[cs-el="sliderIndicator"]');
  updateIndicators();
}

function goToSlide(index) {
  // Handle infinite loop
  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;

  isAnimating = true;

  // Animate slides
  gsap.to(slides, {
    xPercent: (i) => settings.slideSpacing * (i - index),
    duration: settings.duration,
    ease: settings.ease,
    onComplete: () => {
      isAnimating = false;
      currentSlide = index;
      updateIndicators();
    },
  });
}

function updateIndicators() {
  indicators.forEach((indicator, i) => {
    const inner = indicator.querySelector('[cs-el="sliderIndicatorInner"]');
    gsap.to(inner, {
      scaleX: i === currentSlide ? 1 : 0,
      duration: 0.4,
    });
  });
}

function startSlider() {
  // Animate cover away
  gsap.to(cover, {
    yPercent: -100,
    duration: settings.coverTransitionDuration,
    ease: 'power2.inOut',
    onComplete: () => {
      // Start autoplay only if enabled
      if (settings.autoplay) {
        autoplayInterval = setInterval(() => {
          if (!isAnimating) goToSlide(currentSlide + 1);
        }, settings.autoplayDelay * 1000);
      }
    },
  });
}

// Initialize on load
initSlider();
