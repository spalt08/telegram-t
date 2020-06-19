import { MOBILE_SCREEN_MAX_WIDTH } from '../config';

export function getPlatform() {
  const { userAgent, platform } = window.navigator;
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
  const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
  let os: 'Mac OS' | 'iOS' | 'Windows' | 'Android' | 'Linux' | undefined;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (/Linux/.test(platform)) {
    os = 'Linux';
  }

  return os;
}

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export const PLATFORM_ENV = getPlatform();
export const IS_TOUCH_ENV = window.matchMedia('(pointer: coarse)').matches;
export const IS_MOBILE_SCREEN = window.innerWidth <= MOBILE_SCREEN_MAX_WIDTH;
export const IS_VOICE_RECORDING_SUPPORTED = (navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices && (
  window.AudioContext || (window as any).webkitAudioContext
));
export const IS_SMOOTH_SCROLL_SUPPORTED = 'scrollBehavior' in document.documentElement.style;
export const IS_EMOJI_SUPPORTED = PLATFORM_ENV && ['Mac OS', 'iOS'].includes(PLATFORM_ENV);
export const IS_SERVICE_WORKER_SUPPORTED = 'serviceWorker' in navigator;
// TODO Consider failed service worker
export const IS_PROGRESSIVE_SUPPORTED = IS_SERVICE_WORKER_SUPPORTED;
export const IS_PROGRESSIVE_AUDIO_SUPPORTED = IS_PROGRESSIVE_SUPPORTED && !isSafari;
export const IS_OPUS_SUPPORTED = Boolean((new Audio()).canPlayType('audio/ogg; codecs=opus'));

let isWebpSupportedCache: boolean | undefined;

export function isWebpSupported() {
  if (isWebpSupportedCache === undefined) {
    isWebpSupportedCache = document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp');
  }

  return isWebpSupportedCache;
}
