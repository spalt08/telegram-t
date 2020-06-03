import React, { useCallback, useState } from '../lib/teact/teact';

type BufferingEvent = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => void;

const MIN_READY_STATE = 3;

export default () => {
  const [isBuffered, setIsBuffered] = useState(false);

  const handleBuffering = useCallback<BufferingEvent>((e) => {
    setIsBuffered(e.currentTarget.readyState >= MIN_READY_STATE);
  }, []);

  const bufferingHandlers = {
    onLoadStart: handleBuffering, // Safari initial
    onLoadedData: handleBuffering,
    onPlaying: handleBuffering,
    onPause: handleBuffering, // Chrome seeking
  };

  return { isBuffered, bufferingHandlers };
};
