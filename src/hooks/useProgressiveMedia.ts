import { useEffect, useRef, useState } from '../lib/teact/teact';

import useShowTransition from './useShowTransition';

const ANIMATION_DURATION = 150;

export default (mediaData?: any, noAnimate = false) => {
  const isMediaLoaded = Boolean(mediaData);
  const willAnimate = !useRef(isMediaLoaded).current || noAnimate;
  const [shouldRenderThumb, setShouldRenderThumb] = useState(willAnimate);

  const {
    shouldRender: shouldRenderFullMedia,
    transitionClassNames,
  } = useShowTransition(isMediaLoaded, undefined, !willAnimate);

  useEffect(() => {
    if (willAnimate && shouldRenderFullMedia) {
      setTimeout(() => {
        setShouldRenderThumb(false);
      }, ANIMATION_DURATION);
    }
  }, [willAnimate, shouldRenderFullMedia]);

  return {
    shouldRenderThumb,
    shouldRenderFullMedia,
    transitionClassNames,
  };
};
