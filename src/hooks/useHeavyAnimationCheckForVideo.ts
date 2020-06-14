import { RefObject } from 'react';
import { useRef } from '../lib/teact/teact';

import useHeavyAnimationCheck from './useHeavyAnimationCheck';
import safePlay from '../util/safePlay';

export default (playerRef: RefObject<HTMLVideoElement>, shouldPlay: boolean) => {
  const shouldPlayRef = useRef();
  shouldPlayRef.current = shouldPlay;

  useHeavyAnimationCheck(
    () => {
      if (playerRef.current) {
        playerRef.current.pause();
      }
    },
    () => {
      if (playerRef.current && shouldPlayRef.current) {
        safePlay(playerRef.current);
      }
    },
  );
};
