import { useLayoutEffect, useState } from '../lib/teact/teact';
import { PLATFORM_ENV } from '../util/environment';

type RefType = {
  current: HTMLElement | null;
};

type ReturnType = [boolean, () => void, () => void] | [false];
type CallbackType = (isPlayed: boolean) => void;

declare global {
  interface Document {
    mozFullScreenElement: any;
    webkitFullscreenElement: any;
    mozCancelFullScreen?: () => Promise<void>;
    webkitCancelFullScreen?: () => Promise<void>;
    webkitExitFullscreen?: () => Promise<void>;
  }

  interface HTMLElement {
    mozRequestFullScreen?: () => Promise<void>;
    webkitEnterFullscreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
  }
}

const prop = getBrowserFullscreenElementProp();

export default function useFullscreenStatus(elRef: RefType, setIsPlayed: CallbackType): ReturnType {
  const [isFullscreen, setIsFullscreen] = useState(Boolean(prop && document[prop] !== null));

  const setFullscreen = () => {
    if (elRef.current === null || !(prop || PLATFORM_ENV === 'iOS')) {
      return;
    }

    if (elRef.current.webkitEnterFullscreen) {
      elRef.current.webkitEnterFullscreen();
    } else if (elRef.current.requestFullscreen) {
      elRef.current.requestFullscreen();
    } else if (elRef.current.mozRequestFullScreen) {
      elRef.current.mozRequestFullScreen();
    } else if (elRef.current.webkitRequestFullscreen) {
      elRef.current.webkitRequestFullscreen();
    }

    setIsFullscreen(true);
  };

  const exitFullscreen = () => {
    if (elRef.current === null) {
      return;
    }

    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }

    setIsFullscreen(false);
  };

  useLayoutEffect(() => {
    const listener = () => { setIsFullscreen(Boolean(prop && document[prop] !== null)); };
    const listenerEnter = () => { setIsFullscreen(true); };
    const listenerExit = () => {
      setIsFullscreen(false);
      setIsPlayed(false);
    };
    const video = elRef.current;

    document.addEventListener('fullscreenchange', listener, false);
    document.addEventListener('webkitfullscreenchange', listener, false);
    document.addEventListener('mozfullscreenchange', listener, false);

    if (video) {
      video.addEventListener('webkitbeginfullscreen', listenerEnter, false);
      video.addEventListener('webkitendfullscreen', listenerExit, false);
    }

    return () => {
      document.removeEventListener('fullscreenchange', listener, false);
      document.removeEventListener('webkitfullscreenchange', listener, false);
      document.removeEventListener('mozfullscreenchange', listener, false);
      if (video) {
        video.removeEventListener('webkitbeginfullscreen', listenerEnter, false);
        video.removeEventListener('webkitendfullscreen', listenerExit, false);
      }
    };
    // eslint-disable-next-line
  }, []);

  if (!prop && PLATFORM_ENV !== 'iOS') {
    return [false];
  }

  return [isFullscreen, setFullscreen, exitFullscreen];
}

function getBrowserFullscreenElementProp() {
  if (typeof document.fullscreenElement !== 'undefined') {
    return 'fullscreenElement';
  } else if (typeof document.mozFullScreenElement !== 'undefined') {
    return 'mozFullScreenElement';
  } else if (typeof document.webkitFullscreenElement !== 'undefined') {
    return 'webkitFullscreenElement';
  }

  return '';
}
