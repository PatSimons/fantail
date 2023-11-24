/* COMPONENTS > SLIDERS

//// DATA ATTRIBUTES:
[cs-el="slider"]

[cs-el="slider-cover"]
  [cs-el="slider-start"]
  
[cs-el="slides"]
  [cs-el="slide"]
  [cs-el="slide"]
  ...

[cs-el="slider-nav"]
  [cs-el="slider-nav_prev"] > Needs CSS class 'is-muted' defined
  [cs-el="slider-nav_next"] > Needs CSS class 'is-muted' defined

[cs-el="slider-indicators"]
  [cs-el="slider-indicator"] > Needs CSS class 'is-active' defined

//// CONFIG OPTIONS
[cs-el="slider"] >
  [slider-type="fade (default) | slide | updown"]
  [slider-type="slide"] 
  [slider-controls="toggle"] 
  [slider-loop="loop"] 
  [slider-autoplay="play"]

////  HTML MARK-UP:
<div cs-el="slider">
  <div cs-el="slide"></div>
  <div cs-el="slider-nav">
    <div cs-el="slider-nav_prev">
    <div cs-el="slider-nav_next">
  </div>
  <div cs-el="slider-indicators">
    <div cs-el="slider-indicator">
      <div cs-el="slider-indicator-inner"></div>
    </div>
  </div>
  <div cs-el="slider-cover">
    <div cs-el="slider-start">
    </div>    
  </div>  
*/

import { gsap } from 'gsap';
// import { Observer } from 'gsap/Observer';
// gsap.registerPlugin(Observer);

import { gsapDuration, gsapEaseType } from '$utils/globalvars';

// Export Initialize all sliders
export function initSliders() {
  const sliders = gsap.utils.toArray<HTMLElement>('[cs-el="slider"]');
  sliders.forEach((slider) => {
    if (slider) {
      initSlider(slider); // Call the function for each slider
    }
  });
} // End: Initialize all sliders

// Init each Slider
function initSlider(slider: HTMLElement) {
  const slides: NodeListOf<HTMLElement> = slider.querySelectorAll<HTMLElement>('[cs-el="slide"]');
  const slidesLength = slides.length;

  // Abort if there are no slides.
  if (slidesLength === 0) return;

  // Remove Nav, Indicators and Cover and abort if there'e only 1 slide
  if (slidesLength === 1) {
    removeElementsByAttribute('slider-nav');
    removeElementsByAttribute('slider-indicators');
    removeElementsByAttribute('slider-cover');
    return;
  }

  function removeElementsByAttribute(attributeValue: string): void {
    const elements = document.querySelectorAll<HTMLElement>(`[cs-el="${attributeValue}"]`);
    elements.forEach((element) => {
      element.remove();
    });
  }

  let sliderType = slider.getAttribute('slider-type');
  if (!sliderType) sliderType = 'fade';

  // Declare some vars
  let count: number;
  const transitionDuration = 0.5;
  const sliderEaseIn = 'power2.out';
  const sliderEaseOut = 'power2.out';
  let next: HTMLElement | null;
  let prev: HTMLElement | null;
  let isFirstSlide = false;
  let isLastSlide = false;
  const playDuration = 3000;
  const tl_slideIn: gsap.core.Timeline = gsap.timeline({ paused: true });
  const tl_slideOut: gsap.core.Timeline = gsap.timeline({ paused: true });
  let initialSlide = true;
  const allowNext = true;
  const allowPrev = true;
  const tl_toggleControls = gsap.timeline({ paused: true });

  // Find Base Elements for Config
  const nav = slider.querySelector<HTMLElement>('[cs-el="slider-nav"]');
  if (nav) setupNav(nav);

  const indicators = slider.querySelector<HTMLElement>('[cs-el="slider-indicators"]');
  let allIndicators: HTMLElement[] = [];
  if (indicators) allIndicators = setupIndicators();

  const cover = slider.querySelector<HTMLElement>('[cs-el="slider-cover"]');

  // Additional Config
  const getLoop = slider.getAttribute('slider-loop');
  let loop = false;
  if (getLoop === 'loop') {
    loop = true;
  }
  const GetToggleControls = slider.getAttribute('slider-controls');
  let toggleControls = false;
  if (GetToggleControls === 'toggle') {
    toggleControls = true;
    setupToggleControls();
  }

  const getAutoPlay = slider.getAttribute('slider-autoplay');
  let isPlaying: number | undefined;
  if (getAutoPlay === 'play') {
    playSlider();
  }

  // Set opacity 0 all slides.
  gsap.set(slides, { opacity: 0 });

  // Initialise all Prev/Next listeners ([cs-el="slider-next"] / [cs-el="slider-prev"])
  function initAllPrevNextButtons() {
    const allNextButtons: NodeListOf<HTMLElement> =
      slider.querySelectorAll('[cs-el="slider-next"]');
    const allPrevButtons: NodeListOf<HTMLElement> =
      slider.querySelectorAll('[cs-el="slider-prev"]');
    if (allNextButtons.length > 0) {
      allNextButtons.forEach((el: HTMLElement) => {
        el.addEventListener('click', goNext);
      });
    }
    if (allPrevButtons.length > 0) {
      allPrevButtons.forEach((el: HTMLElement) => {
        el.addEventListener('click', goPrev);
      });
    }
  }
  initAllPrevNextButtons();

  // Function to set up next/prev navigation.
  function setupNav(nav: HTMLElement) {
    next = nav.querySelector<HTMLElement>('[cs-el="slider-nav_next"]');
    prev = nav.querySelector<HTMLElement>('[cs-el="slider-nav_prev"]');

    // Set CSS pointer-events
    nav.style.pointerEvents = 'none';
    if (next) next.style.pointerEvents = 'auto';
    if (prev) prev.style.pointerEvents = 'auto';

    navAddEventListeners(null);
  }
  // Play Slider
  function playSlider() {
    isPlaying = setInterval(() => slideAction('next'), playDuration);
  }
  // Stop Slider
  function stopSlider(ap: number | undefined) {
    clearInterval(ap);
  }

  // Function to set up indicator navigation.
  function setupIndicators(): HTMLElement[] {
    // Check if indicator wrapper is present
    const sliderIndicators = slider.querySelector('[cs-el="slider-indicators"]');
    if (!sliderIndicators) {
      // eslint-disable-next-line no-console
      console.log('no sliderIndicators found');
      return [];
    }
    // Check if indicator elelemnt is present
    const indicator = sliderIndicators.querySelectorAll<HTMLElement>('[cs-el="slider-indicator"]');
    if (indicator.length === 0) {
      // eslint-disable-next-line no-console
      console.log('no indicator found');
      return [];
    }
    if (indicator.length === 1) {
      // Clone the indicator element for each slide
      const slideArray = Array.from(slides);
      slideArray.slice(0, -1).forEach(() => {
        const clonedIndicator = indicator[0].cloneNode(true);
        indicator[0].parentNode?.appendChild(clonedIndicator);
      });
    }
    // Make array of all Indicator elements
    const indicatorsArray = sliderIndicators.querySelectorAll<HTMLElement>(
      '[cs-el="slider-indicator"]'
    );
    // Add EventListeners to all indicators
    indicatorsArray.forEach((indicator, i) => {
      indicator.addEventListener('click', () => goIndex(i));
    });
    return indicatorsArray;
  }

  // setup toggleControls
  function setupToggleControls() {
    tl_toggleControls.from(next, {
      autoAlpha: 0,
      duration: gsapDuration,
      ease: gsapEaseType,
      x: '-100%',
    });
    tl_toggleControls.from(
      prev,
      { autoAlpha: 0, duration: gsapDuration, ease: gsapEaseType, x: '100%' },
      '<'
    );
    const sliderIndicators = slider.querySelector('[cs-el="slider-indicators"]');
    tl_toggleControls.from(
      sliderIndicators,
      {
        autoAlpha: 0,
        delay: 0.25,
        duration: gsapDuration,
        ease: gsapEaseType,
      },
      '<'
    );
    // Set toggleControls listeners to slide. Accept when Cover is set.
    if (!cover) {
      slider.addEventListener('mouseenter', aL_mouseEnter);
      slider.addEventListener('mouseleave', aL_mouseLeave);
    }
  }

  function aL_mouseEnter() {
    tl_toggleControls.timeScale(1).play();
  }
  function aL_mouseLeave() {
    tl_toggleControls.timeScale(2).reverse();
  }

  // Function to set up swipe on touch devices.
  function setSwipe() {
    console.log('Fnc setSwipe called');

    // Observer.create({
    //   target: slider,
    //   type: 'touch',
    //   dragMinimum: 100,
    //   onLeft: () => goNext(),
    //   onRight: () => goPrev(),
    // });

    //console.log('swipe setup');
  }

  //// Function to handle slider transitions.
  function slideAction(dir: 'next' | 'prev' | null, index?: number | null) {
    console.log('Fnc slideAction called');
    // Disallow Prev/Next condition
    if (index && index > count && !allowNext) return;
    if (index && index < count && !allowPrev) return;

    // Set slider Type
    const transitionType = sliderType;

    // Fade out current slide, only if not initial slide
    if (!initialSlide) gsapSlideOut(count);
    initialSlide = false;

    // Go directly to slide index or to next/prev slide
    if (typeof index === 'number' && index >= 0 && index < slidesLength) {
      // Determine direction
      if (count > index) {
        dir = 'prev';
      }
      if (count < index) {
        dir = 'next';
      }
      count = index;
      gsapSlideIn(count);
    } else {
      if (dir === 'next') {
        // Set count to next slide index. If 'loop = true' slides will loop back to first slide
        count = count < slidesLength - 1 ? count + 1 : loop ? 0 : count;
        gsapSlideIn(count);
      } else if (dir === 'prev') {
        // Set count to previous slide index. If 'loop = true' slides will loop back to last slide
        count = count > 0 ? count - 1 : loop ? slidesLength - 1 : count;
        gsapSlideIn(count);
      }
    }
    // Check current slide
    checkSlideIndex(count);

    // if no loop
    if (!loop) {
      next?.classList.remove('is-muted');
      prev?.classList.remove('is-muted');
      navAddEventListeners(null);
      if (isFirstSlide) ifIsFirstSlide();
      if (isLastSlide) ifIsLastSlide();
    }
    // Set indicator to current slide
    if (indicators) {
      setActiveindicator(count);
    }

    // Do the actual slide animations In and Out
    function gsapSlideIn(i: number) {
      if (transitionType === 'fade') {
        tl_slideIn.fromTo(slides[i], { opacity: 0 }, { duration: transitionDuration, opacity: 1 });
      } else if (transitionType === 'slide') {
        const xPercent = dir === 'next' ? 50 : dir === 'prev' ? -50 : 0;
        tl_slideIn.fromTo(
          slides[i],
          { opacity: 0, xPercent },
          { duration: transitionDuration, opacity: 1, xPercent: 0, ease: sliderEaseIn }
        );
      } else if (transitionType === 'updown') {
        const yPercent = dir === 'next' ? 50 : dir === 'prev' ? -50 : 0;
        tl_slideIn.fromTo(
          slides[i],
          { opacity: 0, yPercent },
          { duration: transitionDuration, opacity: 1, yPercent: 0, ease: sliderEaseIn }
        );
      }

      gsap.set(slides, { zIndex: 1 });
      slides[i].style.zIndex = '2';
      tl_slideIn.timeScale(1).play();
    }

    function gsapSlideOut(i: number) {
      if (transitionType === 'fade') {
        tl_slideOut.to(slides[i], { duration: transitionDuration, opacity: 0 });
      } else if (transitionType === 'slide') {
        const xPercent = dir === 'next' ? -50 : dir === 'prev' ? 50 : 0;
        tl_slideOut.fromTo(
          slides[i],
          { opacity: 1, xPercent: 0 },
          { duration: transitionDuration, opacity: 0, xPercent, ease: sliderEaseOut }
        );
      } else if (transitionType === 'updown') {
        const yPercent = dir === 'next' ? -50 : dir === 'prev' ? 50 : 0;
        tl_slideOut.fromTo(
          slides[i],
          { opacity: 1, yPercent: 0 },
          { duration: transitionDuration, opacity: 0, yPercent, ease: sliderEaseOut }
        );
      }
      gsap.set(slides, { zIndex: 1 });
      slides[i].style.zIndex = '2';

      tl_slideOut.timeScale(1).play();
    }
  } // End: function Slide Action

  //// Function to check slide index and update navigation accordingly.
  function checkSlideIndex(count: number) {
    isFirstSlide = count === 0;
    isLastSlide = count === slidesLength - 1;
    //console.log('cnt= ' + count + 'length= ' + (slidesLength - 1));
  }
  //// If is First Slide
  function ifIsFirstSlide() {
    navRemoveEventListeners('prev');
    prev?.classList.add('is-muted');
  }
  //// If is Last Slide
  function ifIsLastSlide() {
    navRemoveEventListeners('next');
    next?.classList.add('is-muted');
    if (isPlaying) stopSlider(isPlaying);
  }

  //// Function to set the active indicators.
  function setActiveindicator(index: number) {
    allIndicators.forEach((indicator: HTMLElement, i) => {
      if (i === index) {
        if (indicator.firstChild instanceof Element) {
          indicator.firstChild.classList.add('is-active');
        }
      } else {
        if (indicator.firstChild instanceof Element) {
          indicator.firstChild.classList.remove('is-active');
        }
      }
    });
  }

  //// Function to go next slide
  function goNext() {
    if (!tl_slideIn.isActive() && allowNext) {
      gsap.killTweensOf(slideAction);
      slideAction('next');
      if (isPlaying) stopSlider(isPlaying);
    }
  }

  //// Function to go previous slide
  function goPrev() {
    if (!tl_slideOut.isActive() && allowPrev) {
      gsap.killTweensOf(slideAction);
      slideAction('prev');
      if (isPlaying) stopSlider(isPlaying);
    }
  }

  //// Function to go to slide Index
  function goIndex(i: number) {
    gsap.killTweensOf(slideAction);
    slideAction(null, i);
    if (isPlaying) stopSlider(isPlaying);
  }

  //// Function to add listeners to slider nav (prev/next)
  function navAddEventListeners(variable: null | 'next' | 'prev') {
    if (!variable) {
      //console.log('navAddEventListeners null called');
      next?.addEventListener('click', goNext);
      prev?.addEventListener('click', goPrev);
    } else if (variable === 'next') {
      next?.addEventListener('click', goNext);
    } else if (variable === 'prev') {
      prev?.addEventListener('click', goPrev);
    }
  }
  //// Function to remove listeners to slider nav (prev/next)
  function navRemoveEventListeners(variable: 'next' | 'prev') {
    if (variable === 'next') {
      next?.removeEventListener('click', goNext);
    }
    if (variable === 'prev') {
      prev?.removeEventListener('click', goPrev);
    }
  }

  //// function setCover
  function setCover(cover: HTMLElement) {
    console.log('Fnc setCover called');
    // Make sure cover is visible
    gsap.to(cover, { autoAlpha: 1 });

    if (!toggleControls) {
      setupToggleControls();
    }
    tl_toggleControls.progress(0);

    const startSliderBtn = slider.querySelector('[cs-el="slider-start"]');
    startSliderBtn?.addEventListener('click', () => {
      startSlider(cover);
    });
  }

  //// Set initial slide
  function startSlider(cover: HTMLElement) {
    console.log('Fnc startSlider called');

    gsap.to(cover, { autoAlpha: 0 });
    slideAction(null, 0);

    tl_toggleControls.timeScale(1).play();
    if (toggleControls) {
      slider.addEventListener('mouseenter', aL_mouseEnter);
      slider.addEventListener('mouseleave', aL_mouseLeave);
    }
  }

  setSwipe();

  //// Call initial slide.
  if (!cover) {
    slideAction(null, 0);
  } else {
    setCover(cover);
  }
} // End: initSlider

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
