import './global';

import { gsap } from './global';

window.Webflow ||= [];
window.Webflow.push(() => {
  const formBlocks = document.querySelectorAll('[cs-el="formBlock"]');

  if (formBlocks.length === 0) return;

  formBlocks.forEach((formBlock) => {
    let qAnswered: boolean;
    qAnswered = false;
    // Select the elements
    const rangeWraps = formBlock.querySelectorAll('[cs-el="rangeWrap"]');
    const formRadioBtns = formBlock.querySelectorAll<HTMLElement>('[cs-el="radioBtn"]');
    const formCheckboxes = formBlock.querySelectorAll<HTMLElement>('[cs-el="checkBox"]');
    const activeElementsContainer = formBlock.querySelector('[cs-el="activeElms"]');
    const formBody = formBlock.querySelector('[cs-el="formBody"]');

    // console.log(maxActiveElms);
    // console.log(formCheckboxes.length);

    // -------------------------------------------------------------------------------------------------------------------- Range Sliders
    if (rangeWraps.length > 0) {
      rangeWraps.forEach((rangeWrap) => {
        const rangeInput = rangeWrap?.querySelector(
          '[cs-el="rangeInput"]'
        ) as HTMLInputElement | null;
        const valA = rangeWrap?.querySelector('[cs-el="a"]') as HTMLInputElement | null;
        const valB = rangeWrap?.querySelector('[cs-el="b"]') as HTMLInputElement | null;

        // Check if all required elements are present
        if (rangeWrap && rangeInput && valA && valB) {
          // Create a GSAP timeline for smooth animation
          const tl = gsap.timeline({ defaults: { duration: 0.5, ease: 'power4.out' } });

          // Function to animate range input value
          const animateRangeValue = (value: number) => {
            tl.to(rangeInput, {
              value: value,
              onUpdate: () => {
                rangeInput.dispatchEvent(new Event('input', { bubbles: true }));
                rangeInput.setAttribute('value', value.toString());
              },
            });
          };

          // Add click event listener to valA
          valA.addEventListener('click', () => {
            valA.classList.add('is-active');
            valB.classList.remove('is-active');
            animateRangeValue(-100);
          });

          // Add click event listener to valB
          valB.addEventListener('click', () => {
            valA.classList.remove('is-active');
            valB.classList.add('is-active');
            animateRangeValue(100);
          });
        } else {
          console.error('One or more required elements are missing.');
        }
      });
    }

    // -------------------------------------------------------------------------------------------------------------------- Radio Buttons
    if (formRadioBtns.length > 0 && formBody) {
      formRadioBtns.forEach((radioBtn) => {
        const formLabel = radioBtn.querySelector('.w-form-label');
        // Define the event handler function
        function handleRadioClick() {
          formRadioBtns.forEach(() => {
            // Remove the 'is-active' class from all radio buttons
            const labels = formBlock.querySelectorAll<HTMLElement>('.w-form-label');
            labels?.forEach((label) => label.classList.remove('is-active'));
          });

          // Add the 'is-active' class to the clicked radio button
          formLabel?.classList.add('is-active');

          // Update question Answered status
          qAnswered = true;
        }

        // Add a click event listener to the element
        radioBtn.addEventListener('click', handleRadioClick);
      });
    }
    // -------------------------------------------------------------------------------------------------------------------- Form Checkboxes
    if (formCheckboxes.length > 0 && formBody) {
      let activeCount = 0; // Counter for active checkboxes
      const maxActiveElms: number = 3;

      function updateCheckboxIndexes() {
        if (!activeElementsContainer) return;
        const activeCheckboxes = activeElementsContainer.querySelectorAll('[cs-el="checkBox"]');
        activeCheckboxes.forEach((box, index) => {
          const indexElement = box.querySelector('[cs-el="checkBoxIndex"]');
          if (indexElement) {
            indexElement.textContent = (index + 1).toString();
          }
        });
      }

      formCheckboxes.forEach((checkBox) => {
        const formLabel = checkBox.querySelector('.w-form-label');
        // Define the event handler function
        function handleCheckboxClick() {
          if (formLabel) {
            const isActive = formLabel.classList.contains('is-active');

            // Check if the checkbox is being activated
            if (!isActive && activeCount >= maxActiveElms) {
              return; // Limit reached, do not activate more checkboxes
            }
            gsap.to(checkBox, { opacity: 0, duration: 0.5, onComplete: () => moveElement() });

            function moveElement() {
              // Toggle the active state
              const indexWrap = checkBox.querySelector('[cs-el="checkBoxIndex"]');
              if (isActive) {
                formLabel?.classList.remove('is-active');
                checkBox.classList.remove('is-active');
                if (indexWrap) indexWrap.textContent = ''; // Clear index when inactive
                formBody?.appendChild(checkBox);
                activeCount -= 1; // Decrease count when deactivating
              } else {
                formLabel?.classList.add('is-active');
                checkBox.classList.add('is-active');
                if (activeElementsContainer && indexWrap) {
                  activeElementsContainer?.appendChild(checkBox);
                }
                activeCount += 1; // Increase count when activating
              }

              gsap.to(checkBox, { opacity: 1, duration: 1 });
              const completedIcon = formBody?.querySelector('[cs-el="completed"]');
              if (completedIcon) {
                gsap.set(completedIcon, { autoAlpha: 0 });
              }

              if (!isActive && activeCount === maxActiveElms) {
                const allInactiveElements = formBody?.querySelectorAll(':not(.is-active)');
                allInactiveElements?.forEach((el) => {
                  el.classList.add('is-disabled');
                });
                if (completedIcon) {
                  gsap.to(completedIcon, { autoAlpha: 1, scale: 1.5, ease: 'back.out' });
                }
              } else {
                const allInactiveElements = formBody?.querySelectorAll('.is-disabled');
                allInactiveElements?.forEach((el) => {
                  el.classList.remove('is-disabled');
                });
                // Update question Answered status
                qAnswered = true;
              }
              updateCheckboxIndexes();
            }
          }
        }
        // Add a different event type, such as 'mousedown', to handle the click
        checkBox.addEventListener('mousedown', handleCheckboxClick);
      });
    }

    // -------------------------------------------------------------------------------------------------------------------- Sliders
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
        loop: false,
        transitionDuration: 0.5,
        showIndicators: true,
        showNavigation: true,
        coverTransitionDirection: 'up', // 'up' | 'down' | 'left' | 'right'
        coverTransitionDuration: 1,
        transitionType: 'slide', // 'slide' | 'fade' | 'crossfade'
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

        // Set initial positions based on transition type
        if (slides) {
          if (settings.transitionType === 'slide') {
            gsap.set(slides, {
              xPercent: (i) => i * settings.slideSpacing,
              autoAlpha: 1,
            });
          } else {
            gsap.set(slides, {
              xPercent: 0,
              autoAlpha: (i) => (i === 0 ? 1 : 0),
            });
          }
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
        const prevSlide = currentSlide;

        // Create timeline for the transition
        const tl = gsap.timeline({
          onComplete: () => {
            isAnimating = false;
            currentSlide = index;
            if (indicators) {
              updateIndicators();
            }
            updateNavigationVisibility();
          },
        });

        switch (settings.transitionType) {
          case 'slide':
            tl.to(slides, {
              xPercent: (i) => settings.slideSpacing * (i - index),
              duration: settings.duration,
              ease: settings.ease,
            });
            break;

          case 'fade':
            tl.to(slides[prevSlide], {
              autoAlpha: 0,
              duration: settings.duration / 2,
              ease: settings.ease,
            })
              .set(slides, { autoAlpha: 0 })
              .set(slides[index], { autoAlpha: 1 });
            break;

          case 'crossfade':
            tl.to(slides[prevSlide], {
              autoAlpha: 0,
              duration: settings.duration,
              ease: settings.ease,
            }).to(
              slides[index],
              {
                autoAlpha: 1,
                duration: settings.duration,
                ease: settings.ease,
              },
              '<'
            );
            break;
        }
      }

      function startSlider(): void {
        if (!cover) return;

        // Define animation properties based on direction
        const animationProps = {
          up: { yPercent: -100, xPercent: 0 },
          down: { yPercent: 100, xPercent: 0 },
          left: { yPercent: 0, xPercent: -100 },
          right: { yPercent: 0, xPercent: 100 },
        }[settings.coverTransitionDirection];

        gsap.to(cover, {
          ...animationProps,
          duration: settings.coverTransitionDuration,
          ease: 'power2.inOut',
          onComplete: () => {
            if (settings.autoplay) {
              autoplayInterval = window.setInterval(() => {
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

    // -------------------------------------------------------------------------------------------------------------------- Questions Status
    function updateQuestionStatus(status: boolean): void {
      qAnswered = status;
      console.log('Question status:', qAnswered);
    }

    updateQuestionStatus(true);

    // -------------------------------------------------------------------------------------------------------------------- Help texts
    const explainerData = formBlock.querySelectorAll<HTMLElement>('[data-explainer]');
    const explainer = formBlock.querySelector<HTMLElement>('[cs-el="explainer"]');
    //console.log('Number of explainer elements found:', explainerData.length);

    if (explainerData.length > 0 && explainer) {
      explainerData.forEach((el) => {
        const helpText = el.getAttribute('data-explainer');

        if (helpText) {
          // Mouse enter event (hover start)
          el.addEventListener('mouseenter', () => {
            gsap.to(explainer, {
              autoAlpha: 0,
              duration: 0.25,
              onComplete: () => {
                explainer.textContent = helpText;
                gsap.to(explainer, { autoAlpha: 1, duration: 0.5 });
              },
            });
          });

          // Mouse leave event (hover end)
          el.addEventListener('mouseleave', () => {
            gsap.to(explainer, {
              autoAlpha: 0,
              duration: 0.25,
              onComplete: () => {
                explainer.textContent = '';
              },
            });
          });
        }
      });
    } else {
      console.error('No explainer elements found or explainer container is missing.');
    }
  });
});
