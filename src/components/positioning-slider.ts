/* COMPONENTS > SLIDERS */

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
  const getSlides = gsap.utils.toArray<HTMLElement>('[cs-el="slide"]');
  const slidesLength = getSlides.length;
  const slides = getSlides;
  //const slides = gsap.utils.shuffle(getSlides);

  // Abort if there are no slides.
  if (slidesLength === 0) return;

  slides.forEach((slide: HTMLElement) => {
    // Populate Form Elements
    const radioWraps = document.querySelectorAll<HTMLElement>('[cs-el="radios-wrap"]');
    radioWraps.forEach((el) => {
      const questionNumber = el.getAttribute('qi');
      const questionArchetype = el.getAttribute('archetype');
      const radios = el.querySelectorAll<HTMLElement>('.w-radio');
      radios.forEach((radio) => {
        const radioInput = radio.querySelector('input');
        radioInput?.setAttribute('name', `${questionArchetype}_${questionNumber}`);
        radioInput?.setAttribute('data-name', `${questionArchetype}_${questionNumber}`);
      });
    });

    // Add/remove class on click Form Radio Buttons
    const formRadioBtns = gsap.utils.toArray<HTMLElement>('.w-radio', slide);
    if (formRadioBtns.length > 0) {
      formRadioBtns.forEach((el: HTMLElement) => {
        // Define the event handler function
        function handleRadioClick() {
          formRadioBtns.forEach((radio: HTMLElement) => {
            // Remove the 'is-checked' class from all radio buttons
            radio.classList.remove('is-checked');
          });

          // Add the 'is-checked' class to the clicked radio button
          el.classList.add('is-checked');

          // Go to Next slide
          goNext();
        }

        // Add a click event listener to the element
        el.addEventListener('click', handleRadioClick);
      });
    }
  });

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
  const transitionDuration = 1;
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
    // Check if a radio button is checked
    checkRadioButtons();

    setProgressBar(slidesLength, count);

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
      slides[i].classList.add('is-active');

      const radioButtons = gsap.utils.toArray('.w-radio', slides[i]);
      gsap.fromTo(
        radioButtons,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, stagger: 0.1, delay: 0.1 }
      );
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
      slides[i].classList.remove('is-active');

      const radioButtons = gsap.utils.toArray('.w-radio', slides[i]);
      gsap.set(radioButtons, { opacity: 0 });
      tl_slideOut.timeScale(4).play();
    }
    // Positioning only
    infoButtonaddListeners();
  } // End: function Slide Action

  //// Function to check slide index and update navigation accordingly.
  function checkSlideIndex(count: number) {
    isFirstSlide = count === 0;
    isLastSlide = count === slidesLength - 1;
    //console.log('cnt= ' + count + 'length= ' + (slidesLength - 1));
  }
  //// set Progress Bar
  function setProgressBar(totalSlides: number, currentSlide: number): void {
    const progressBarElement = document.querySelector('[cs-el="slider-progress-bar"]');
    const progressIntElement = document.querySelector<HTMLElement>('[cs-el="progress-number"]');

    if (progressBarElement) {
      const widthPercentage = (currentSlide / totalSlides) * 100;

      gsap.to(progressBarElement, {
        duration: 0.5,
        width: `${widthPercentage}%`,
        ease: 'power2.inOut', // You can adjust the easing function as needed
      });
      if (progressIntElement) {
        progressIntElement.textContent = `${currentSlide + 1} / ${totalSlides}`;
      }
    }
  }

  //// Function to check slide index and update navigation accordingly.
  function checkRadioButtons() {
    //console.log('ckec radios called');
    const activeSlide = document.querySelector('[cs-el="slide"].is-active');
    //console.log(activeSlide);
    const checkedRadio = activeSlide?.querySelector('.w-radio.is-checked');
    //console.log(checkedRadio);

    if (!checkedRadio) {
      console.log('checked');
      next?.classList.add('is-muted');
      //NextIsAlowed();
    } else {
      console.log('nothing checked');
      next?.classList.remove('is-muted');
      //NextNotAlowed();
    }
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

  //// Function to add listeners to Info Button
  function infoButtonaddListeners() {
    // set Info Button listeners
    const infoButton = document.querySelector('[cs-el="infoButton"]');
    if (infoButton) {
      const activeSlide = document.querySelector('[cs-el="slide"].is-active');
      const infoBlock = activeSlide?.querySelector('[cs-el="infoBlock"]');
      let isOpen = false;
      if (infoBlock) {
        const tl_openInfo = gsap.timeline({ paused: true });
        tl_openInfo.fromTo(infoButton, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.1 });
        tl_openInfo.to(infoBlock, { autoAlpha: 1, duration: 0.25 }, '<');

        infoButton.addEventListener('click', () => {
          tl_openInfo.timeScale(1).play();
          isOpen = true;
        });
        document.addEventListener('keypress', (event) => {
          if (event.key === 'i' && !isOpen) {
            tl_openInfo.timeScale(1).play();
            isOpen = true;
          }
          if (event.key === 'x' && isOpen) {
            isOpen = false;
            tl_openInfo.timeScale(2).reverse();
          }
        });
        document.addEventListener('keydown', (event) => {
          // console.log(event.key);
          // if (event.key === 'ArrowRight') {
          //   goNext();
          // }
          // if (event.key === 'ArrowRight') {
          //   goPrev();
          // }
          switch (event.key) {
            case 'ArrowRight':
            case 'ArrowLeft':
              event.preventDefault(); // Prevent default behavior for these keys
              break;
            default:
              break;
          }
        });

        const closeButtons = document.querySelectorAll<HTMLElement>('[cs-el="closeInfo"]');
        if (closeButtons.length > 0) {
          closeButtons.forEach((el) => {
            el.addEventListener('click', () => {
              tl_openInfo.timeScale(2).reverse();
            });
          });
        }
      }
    }
  }

  //// function setCover
  function setCover(cover: HTMLElement) {
    console.log('Fnc setCover called');
    // Make sure cover is visible
    gsap.to(cover, { autoAlpha: 1 });

    // if (!toggleControls) {
    //   setupToggleControls();
    // }
    // tl_toggleControls.progress(0);

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
