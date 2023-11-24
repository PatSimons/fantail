/* COMPONENTS > MARQUEES

//// DATA ATTRIBUTES:
[cs-el="marquee"]

[cs-el="marquee-content"]
  [cs-el="marquee-content_item"]

//// CONFIG OPTIONS
[cs-el="slider"] >
  [slider-type="fade (default) | slide | updown"]
  [slider-type="slide"] 
  [slider-controls="toggle"] 
  [slider-loop="loop"] 
  [slider-autoplay="play"]

*/

import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
// import { InertiaPlugin } from 'gsap/InertiaPlugin';
gsap.registerPlugin(Draggable);
//gsap.registerPlugin(InertiaPlugin);

import { gsapDuration, gsapEaseType } from '$utils/globalvars';

// Export Initialize all Marquees
export function initMarquees() {
  const marquees = gsap.utils.toArray<HTMLElement>('[cs-el="marquee"]');
  marquees.forEach((marquee) => {
    if (marquee) {
      initMarquee(marquee); // Call the function for each marquee
    }
  });
} // End: Initialize all Marquees

// Init each Marquee
function initMarquee(marquee: HTMLElement) {
  const marqueeType = marquee?.getAttribute('cs-marquee-type');
  const marqueeDirection = marquee?.getAttribute('cs-marquee-direction');
  const marqueeDrag = marquee?.getAttribute('cs-marquee-nodrag');
  const duration = 100;
  const marqueeContent = marquee.querySelector('[cs-el="marquee-content"]');
  if (!marqueeContent) {
    //console.log('No marquee content present!');
    return;
  }
  if (!marqueeDrag && isMobile) {
    //console.log('drag');
    Draggable.create(marqueeContent, {
      type: 'x',
      bounds: marquee,
      //inertia: true,
    });
    return;
  }
  const marqueeContentClone = marqueeContent.cloneNode(true);
  marquee.append(marqueeContentClone);

  let tween: any;
  const progress = tween ? tween.progress() : 0;
  tween && tween.progress(0).kill();
  const width = parseInt(getComputedStyle(marqueeContent).getPropertyValue('width'), 10);
  const distanceToTranslate = -width / (marqueeType === 'scroll' ? 8 : 1);

  let startPoint = 0;
  let endPoint = distanceToTranslate;
  if (marqueeDirection === 'right') {
    startPoint = distanceToTranslate;
    endPoint = 0;
  }
  if (marqueeType === 'scroll') {
    tween = gsap.fromTo(
      marquee.children,
      { x: startPoint },
      {
        x: endPoint,
        duration,
        scrollTrigger: {
          trigger: marqueeContent,
          scrub: true,
          start: 'top bottom',
          end: 'bottom top',
          invalidateOnRefresh: true,
        },
      }
    );
  }
  if (marqueeType === 'loop') {
    tween = gsap.fromTo(
      marquee.children,
      { x: startPoint },
      {
        x: endPoint,
        duration,
        repeat: -1,
      }
    );
  }
  tween.progress(progress);
} // End: Fnc initMarquee

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
