import React, { useCallback, useState } from '../lib/teact/teact';

type BufferingEvent = (e: Event | React.SyntheticEvent<HTMLMediaElement>) => void;

const MIN_READY_STATE = 3;

export default (cb?: BufferingEvent, shouldWatchTimeUpdate = false) => {
  const [isBuffered, setIsBuffered] = useState(true);

  const handleBuffering = useCallback<BufferingEvent>((e) => {
    const media = e.currentTarget as HTMLMediaElement;
    setIsBuffered(media.readyState >= MIN_READY_STATE && (!shouldWatchTimeUpdate || media.currentTime > 0));
    if (cb) {
      cb(e);
    }
  }, [cb, shouldWatchTimeUpdate]);

  const bufferingHandlers = {
    onLoadStart: handleBuffering, // Safari initial
    onLoadedData: handleBuffering,
    onPlaying: handleBuffering,
    onPause: handleBuffering, // Chrome seeking,
    ...(shouldWatchTimeUpdate && {
      onTimeUpdate: handleBuffering, // iOS audio
    }),
  };

  return {
    isBuffered,
    bufferingHandlers,
    checkBuffering(element: HTMLMediaElement) {
      setIsBuffered(element.readyState >= MIN_READY_STATE);
    },
  };
};
