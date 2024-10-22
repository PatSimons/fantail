import './global';

import { gsap } from './global';

window.Webflow ||= [];
window.Webflow.push(() => {
  // Select the elements
  const rangeWraps = document.querySelectorAll('[cs-el="rangeWrap"]');
  if (rangeWraps.length === 0) return;
  rangeWraps.forEach((rangeWrap) => {
    const rangeInput = rangeWrap?.querySelector('[cs-el="rangeInput"]') as HTMLInputElement | null;
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

  // Webflow Custom Form Radio Buttons
  const formRadioBtns = gsap.utils.toArray<HTMLElement>('.w-radio');
  if (formRadioBtns.length > 0) {
    formRadioBtns.forEach((el) => {
      const formLabel = el.querySelector('.w-form-label');
      // Define the event handler function
      function handleRadioClick() {
        formRadioBtns.forEach(() => {
          // Remove the 'is-active' class from all radio buttons
          const parentElement = el.parentNode;
          const labels = parentElement?.querySelectorAll<HTMLElement>('.w-form-label');
          labels?.forEach((label) => label.classList.remove('is-active'));
        });

        // Add the 'is-active' class to the clicked radio button
        formLabel?.classList.add('is-active');
      }

      // Add a click event listener to the element
      el.addEventListener('click', handleRadioClick);
    });
  }
  // Webflow Custom Form Checkboxes
  const formCheckboxes = gsap.utils.toArray<HTMLElement>('.w-checkbox');
  if (formCheckboxes.length > 0) {
    let activeCount = 0; // Counter for active checkboxes

    formCheckboxes.forEach((el) => {
      const formLabel = el.querySelector('.w-form-label');
      // Define the event handler function
      function handleCheckboxClick() {
        if (formLabel) {
          const isActive = formLabel.classList.contains('is-active');
          const parentElement = el.parentNode;

          // Check if the checkbox is being activated
          if (!isActive && activeCount >= 3) {
            return; // Limit reached, do not activate more checkboxes
          }
          gsap.to(el, { opacity: 0, duration: 0.5, onComplete: () => moveElement() });

          function moveElement() {
            // Toggle the active state
            if (isActive) {
              //gsap.to(el, { opacity: 0, duration: 0.5 });
              formLabel?.classList.remove('is-active');
              el.classList.remove('is-active');
              parentElement?.appendChild(el);
              activeCount--; // Decrease count when deactivating
            } else {
              formLabel?.classList.add('is-active');
              el.classList.add('is-active');

              if (parentElement) {
                const firstInactiveElement = Array.from(parentElement.children).find(
                  (child) => !child.classList.contains('is-active')
                );
                if (firstInactiveElement) {
                  parentElement.insertBefore(el, firstInactiveElement);
                } else {
                  parentElement.appendChild(el);
                }
              }
              activeCount++; // Increase count when activating
            }
            gsap.to(el, { opacity: 1, duration: 1 });
            const completedIcon = el.closest('section')?.querySelector('[cs-el="completed"]');
            if (completedIcon) {
              gsap.set(completedIcon, { autoAlpha: 0 });
            }

            if (!isActive && activeCount === 3) {
              const allInactiveElements = parentElement?.querySelectorAll(':not(.is-active)');
              allInactiveElements?.forEach((el) => {
                el.classList.add('is-disabled');
              });
              if (completedIcon) {
                gsap.to(completedIcon, { autoAlpha: 1, scale: 1.5, ease: 'back.out' });
              }
            } else {
              const allInactiveElements = parentElement?.querySelectorAll('.is-disabled');
              allInactiveElements?.forEach((el) => {
                el.classList.remove('is-disabled');
              });
              if (completedIcon) {
                gsap.to(completedIcon, { autoAlpha: 0, scale: 1, ease: 'back.in' });
              }
            }
          }
        }
      }
      // Add a different event type, such as 'mousedown', to handle the click
      el.addEventListener('mousedown', handleCheckboxClick);
    });
  }
});
