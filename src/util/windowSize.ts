import { throttle } from './schedulers';

type IDimensions = {
  width: number;
  height: number;
};

let windowSize = getSize();

function getSize(): IDimensions {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

const handleResize = throttle(() => {
  windowSize = getSize();
}, 250, true);

window.addEventListener('resize', handleResize);

export default {
  get: () => windowSize,
};
