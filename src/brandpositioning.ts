import './global';

import { initSliders } from 'src/components/positioning-slider';

import { gsap } from './global';

window.Webflow ||= [];
window.Webflow.push(() => {
  initSliders();
});
