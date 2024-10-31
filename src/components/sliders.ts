// Slider elements
const sliders = document.querySelectorAll<HTMLElement>('[cs-el="slider"]');
if (sliders.length === 0) return;
sliders.forEach((slider) => {
  const slidesWrap = slider.querySelector<HTMLElement>('[cs-el="slides"]');
  const slides = slidesWrap?.querySelectorAll<HTMLElement>('[cs-el="slide"]');
  const prevBtn = slider.querySelector<HTMLElement>('[cs-el="sliderNavPrev"]');
  const nextBtn = slider.querySelector<HTMLElement>('[cs-el="sliderNavNext"]');
  const cover = slider.querySelector<HTMLElement>('[cs-el="sliderCover"]');
  const startBtn = slider.querySelector<HTMLElement>('[cs-el="sliderStartBtn"]');

  if (!slidesWrap || !slides || !prevBtn || !nextBtn || !cover || !startBtn) return;

  // Slider settings
  const settings = {
    duration: 1,
    slideSpacing: 100, // percentage
    autoplayDelay: 4,
    ease: 'power2.inOut',
    autoplay: false,
    loop: true,
    transitionDuration: 0.5,
    showIndicators: true,
    showNavigation: true,
    coverTransitionDuration: 1,
  } as const;

  // State variables
  let currentSlide = 0;
  let isAnimating = false;
  let indicators: NodeListOf<HTMLElement>;
  let autoplayInterval: number;

  // Add new function to handle navigation visibility
  function updateNavigationVisibility(): void {
    if (!settings.loop && prevBtn && nextBtn && slides) {
      prevBtn.style.display = currentSlide === 0 ? 'none' : 'block';
      nextBtn.style.display = currentSlide === slides.length - 1 ? 'none' : 'block';
    }
  }

  // Initialize slider
  function initSlider(): void {
    // Create indicators only if enabled
    if (settings.showIndicators) {
      createIndicators();
    }

    // Set initial positions
    if (slides) {
      gsap.set(slides, {
        xPercent: (i) => i * settings.slideSpacing,
      });
    }

    // Setup click handlers if navigation is enabled
    if (settings.showNavigation && prevBtn && nextBtn) {
      nextBtn.addEventListener('click', () => !isAnimating && goToSlide(currentSlide + 1));
      prevBtn.addEventListener('click', () => !isAnimating && goToSlide(currentSlide - 1));

      // Hide prev button initially since we start at first slide
      updateNavigationVisibility();
    } else if (prevBtn && nextBtn) {
      // Hide navigation buttons
      nextBtn.style.display = 'none';
      prevBtn.style.display = 'none';
    }

    startBtn?.addEventListener('click', startSlider);

    // Setup indicators if enabled
    if (settings.showIndicators) {
      indicators.forEach((indicator, i) => {
        indicator.addEventListener('click', () => !isAnimating && goToSlide(i));
      });
    }
  }

  // Add new function to create indicators
  function createIndicators(): void {
    const indicatorWrapper = slider?.querySelector<HTMLElement>('[cs-el="sliderIndicators"]');
    if (!indicatorWrapper) return;

    indicatorWrapper.innerHTML = '';

    slides?.forEach(() => {
      const indicator = document.createElement('div');
      indicator.setAttribute('cs-el', 'sliderIndicator');
      indicator.classList.add('slider-indicator');
      indicatorWrapper.appendChild(indicator);
    });

    const newIndicators = slider.querySelectorAll<HTMLElement>('[cs-el="sliderIndicator"]');
    indicators = newIndicators;
    updateIndicators();
  }

  function goToSlide(index: number): void {
    // Early return if slides is undefined
    if (!slides) return;

    // Handle loop behavior based on settings
    if (!settings.loop && (index < 0 || index >= slides.length)) {
      return; // Exit if we're at the end/start and loop is disabled
    }

    // Handle infinite loop only if loop is enabled
    if (settings.loop) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
    }

    isAnimating = true;

    // Animate slides
    gsap.to(slides, {
      xPercent: (i) => settings.slideSpacing * (i - index),
      duration: settings.duration,
      ease: settings.ease,
      onComplete: () => {
        isAnimating = false;
        currentSlide = index;
        if (indicators) {
          updateIndicators();
        }
      },
    });
  }

  function startSlider(): void {
    if (!cover) return;

    gsap.to(cover, {
      yPercent: -100,
      duration: settings.coverTransitionDuration,
      ease: 'power2.inOut',
      onComplete: () => {
        // Only start autoplay if it's enabled in settings
        if (settings.autoplay) {
          autoplayInterval = window.setInterval(() => {
            // Check if we can move to next slide (considering loop setting)
            if (!isAnimating && slides && (settings.loop || currentSlide < slides.length - 1)) {
              goToSlide(currentSlide + 1);
            }
          }, settings.autoplayDelay * 1000);
        }
      },
    });
  }

  function updateIndicators(): void {
    if (!indicators) return;

    // Remove active class from all indicators
    indicators.forEach((indicator) => {
      indicator.classList.remove('is-active');
    });

    // Add active class to current indicator
    indicators[currentSlide]?.classList.add('is-active');
  }

  // Initialize on load
  initSlider();
});
