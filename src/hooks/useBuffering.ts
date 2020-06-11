import React, { useCallback, useState } from '../lib/teact/teact';

type BufferingEvent = (e: Event | React.SyntheticEvent<HTMLMediaElement>) => void;

const MIN_READY_STATE = 3;

export default () => {
  const [isBuffered, setIsBuffered] = useState(true);

  const handleBuffering = useCallback<BufferingEvent>((e) => {
    setIsBuffered((e.currentTarget as HTMLMediaElement).readyState >= MIN_READY_STATE);
  }, []);

  const bufferingHandlers = {
    onLoadStart: handleBuffering, // Safari initial
    onLoadedData: handleBuffering,
    onPlaying: handleBuffering,
    onPause: handleBuffering, // Chrome seeking
  };

  return {
    isBuffered,
    bufferingHandlers,
    checkBuffering(element: HTMLMediaElement) {
      setIsBuffered(element.readyState >= MIN_READY_STATE);
    },
  };
};
