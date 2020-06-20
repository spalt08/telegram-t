import {
  useCallback, useEffect, useRef, useState,
} from '../lib/teact/teact';

import { register } from '../util/audioPlayer';

type Handler = (e: Event) => void;

export default (
  trackId: number,
  originalDuration: number, // Sometimes incorrect for voice messages
  src?: string,
  handlers?: Record<string, Handler>,
  onInit?: (element: HTMLAudioElement) => void,
  isAutoPlay = false,
) => {
  const controllerRef = useRef<ReturnType<typeof register>>();

  const [isPlaying, setIsPlaying] = useState(false);
  let isPlayingSync = isPlaying;

  const [playProgress, setPlayProgress] = useState<number>(0);

  if (!controllerRef.current) {
    controllerRef.current = register(trackId, (eventName, e) => {
      switch (eventName) {
        case 'onPlay':
          setIsPlaying(true);
          break;
        case 'onPause':
          setIsPlaying(false);
          break;
        case 'onTimeUpdate': {
          const { proxy } = controllerRef.current!;
          const duration = proxy.duration && Number.isFinite(proxy.duration) ? proxy.duration : originalDuration;
          setPlayProgress(proxy.currentTime / duration);
          break;
        }
      }

      if (handlers && handlers[eventName]) {
        handlers[eventName](e);
      }
    });

    const { proxy } = controllerRef.current!;

    if (!isPlaying && !proxy.paused) {
      setIsPlaying(true);
      isPlayingSync = true;
    }

    if (onInit) {
      onInit(proxy);
    }
  }

  const {
    play, pause, setCurrentTime, proxy, destroy,
  } = controllerRef.current!;
  const duration = proxy.duration && Number.isFinite(proxy.duration) ? proxy.duration : originalDuration;

  // RAF progress
  useEffect(() => {
    if (duration) {
      setPlayProgress(proxy.currentTime / duration);
    }
  }, [duration, playProgress, proxy]);

  // Cleanup
  useEffect(() => destroy, [destroy]);

  // Autoplay once src is present
  const wasSrcMissingRef = useRef(!src);
  useEffect(() => {
    if (wasSrcMissingRef.current && isAutoPlay && src) {
      play(src);
    }
  }, [isAutoPlay, play, src]);

  const playPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (src) {
      play(src);
    }
  }, [src, pause, play, isPlaying]);

  return {
    isPlaying: isPlayingSync,
    playProgress,
    playPause,
    setCurrentTime,
    audioProxy: proxy,
    duration,
  };
};
