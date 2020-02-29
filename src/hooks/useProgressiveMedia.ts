import { useEffect, useRef, useState } from '../lib/teact/teact';

import useShowTransition from './useShowTransition';

const SPEED = {
  fast: 200,
  slow: 350,
};

export default (mediaData?: any, speed: keyof typeof SPEED = 'fast', noAnimate = false) => {
  const isMediaLoaded = Boolean(mediaData);
  const willAnimate = !useRef(isMediaLoaded).current && !noAnimate;
  const [shouldRenderThumb, setShouldRenderThumb] = useState(willAnimate);

  const {
    shouldRender: shouldRenderFullMedia,
    transitionClassNames,
  } = useShowTransition(isMediaLoaded, undefined, !willAnimate, speed);

  useEffect(() => {
    if (willAnimate && shouldRenderFullMedia) {
      setTimeout(() => {
        setShouldRenderThumb(false);
      }, SPEED[speed]);
    }
  }, [willAnimate, shouldRenderFullMedia, speed]);

  return {
    shouldRenderThumb,
    shouldRenderFullMedia,
    transitionClassNames,
  };
};
