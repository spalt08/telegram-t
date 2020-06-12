import { DEBUG } from '../config';

type Handler = (eventName: string, e: Event) => void;

const tracks: Record<number, {
  audio: HTMLAudioElement;
  proxy: HTMLAudioElement;
  handlers: Handler[];
}> = {};

let currentTrackId: number | undefined;

function createAudio(trackId: number) {
  const audio = new Audio();

  function handleEvent(eventName: string) {
    return (e: Event) => {
      if (!tracks[trackId]) {
        return;
      }

      tracks[trackId].handlers.forEach((handler) => {
        handler(eventName, e);
      });
    };
  }

  audio.addEventListener('timeupdate', handleEvent('onTimeUpdate'));
  audio.addEventListener('play', handleEvent('onPlay'));
  audio.addEventListener('pause', handleEvent('onPause'));
  audio.addEventListener('loadstart', handleEvent('onLoadStart'));
  audio.addEventListener('loadeddata', handleEvent('onLoadedData'));
  audio.addEventListener('playing', handleEvent('onPlaying'));

  return {
    audio,
    proxy: new Proxy(audio, {
      get: (origin, key: keyof HTMLAudioElement) => origin[key],
    }),
    handlers: [],
  };
}

export function register(trackId: number, handler: Handler) {
  if (!tracks[trackId]) {
    tracks[trackId] = createAudio(trackId);
  }

  const { audio, proxy, handlers } = tracks[trackId];

  handlers.push(handler);

  return {
    play(src: string) {
      if (currentTrackId && currentTrackId !== trackId) {
        tracks[currentTrackId].audio.pause();
      }

      currentTrackId = trackId;

      if (!audio.src) {
        audio.src = src;
      }

      audio.play().catch((err) => {
        if (DEBUG) {
          // eslint-disable-next-line no-console
          console.warn(err);
        }
      });
    },

    pause() {
      if (currentTrackId === trackId) {
        audio.pause();
      }
    },

    setCurrentTime(time: number) {
      if (currentTrackId === trackId) {
        audio.currentTime = time;
      }
    },

    proxy,

    destroy() {
      const track = tracks[trackId];
      if (!track) {
        return;
      }

      track.handlers = track.handlers.filter((h) => h !== handler);

      if (!track.handlers.length) {
        track.audio.pause();
        delete tracks[trackId];

        if (trackId === currentTrackId) {
          currentTrackId = undefined;
        }
      }
    },
  };
}
