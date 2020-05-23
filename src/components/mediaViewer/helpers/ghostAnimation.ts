import { ApiMessage } from '../../../api/types';
import { MediaViewerOrigin } from '../../../types';

import { getMessageContent, getPhotoFullDimensions, getVideoDimensions } from '../../../modules/helpers';
import {
  AVATAR_FULL_DIMENSIONS,
  calculateDimensions,
  getMediaViewerAvailableDimensions,
  MEDIA_VIEWER_MEDIA_QUERY,
  REM,
} from '../../common/helpers/mediaDimensions';

import windowSize from '../../../util/windowSize';

const ANIMATION_DURATION = 200;

export function animateOpening(
  message: ApiMessage, hasFooter: boolean, origin: MediaViewerOrigin, bestImageData: string,
) {
  const { mediaEl: fromImage } = getNodes(message, origin)!;
  if (!fromImage) {
    return;
  }

  const { width: windowWidth } = windowSize.get();

  let mediaSize;
  if (message) {
    const { photo, video, webPage } = getMessageContent(message);
    mediaSize = video ? getVideoDimensions(video) : getPhotoFullDimensions((photo || webPage!.photo)!);
  } else {
    mediaSize = AVATAR_FULL_DIMENSIONS;
  }
  const { width: availableWidth, height: availableHeight } = getMediaViewerAvailableDimensions(hasFooter);
  const { width: toWidth, height: toHeight } = calculateDimensions(
    availableWidth, availableHeight, mediaSize!.width, mediaSize!.height,
  );
  const toLeft = (windowWidth - toWidth) / 2;
  const toTop = getTopOffset(hasFooter) + (availableHeight - toHeight) / 2;

  let {
    top: fromTop, left: fromLeft, width: fromWidth, height: fromHeight,
  } = fromImage.getBoundingClientRect();

  if (origin === MediaViewerOrigin.SharedMedia) {
    const uncovered = uncover(toWidth, toHeight, fromTop, fromLeft, fromWidth, fromHeight);
    fromTop = uncovered.top;
    fromLeft = uncovered.left;
    fromWidth = uncovered.width;
    fromHeight = uncovered.height;
  }

  const fromTranslateX = (fromLeft + fromWidth / 2) - (toLeft + toWidth / 2);
  const fromTranslateY = (fromTop + fromHeight / 2) - (toTop + toHeight / 2);
  const fromScaleX = fromWidth / toWidth;
  const fromScaleY = fromHeight / toHeight;

  const ghost = createGhost(bestImageData || fromImage);
  applyStyles(ghost, {
    top: `${toTop}px`,
    left: `${toLeft}px`,
    width: `${toWidth}px`,
    height: `${toHeight}px`,
    transform: `translate3d(${fromTranslateX}px, ${fromTranslateY}px, 0) scale(${fromScaleX}, ${fromScaleY})`,
  });

  document.body.classList.add('ghost-animating');

  requestAnimationFrame(() => {
    document.body.appendChild(ghost);

    requestAnimationFrame(() => {
      ghost.style.transform = '';

      setTimeout(() => {
        requestAnimationFrame(() => {
          document.body.removeChild(ghost);
          document.body.classList.remove('ghost-animating');
        });
      }, ANIMATION_DURATION + 100);
    });
  });
}

export function animateClosing(message: ApiMessage, origin: MediaViewerOrigin) {
  const { container, mediaEl: toImage } = getNodes(message, origin);
  if (!toImage) {
    return;
  }

  const fromImage = document.getElementById('MediaViewer')!.querySelector<HTMLImageElement>(
    '.active .media-viewer-content img, .active .media-viewer-content video',
  );
  if (!fromImage || !toImage) {
    return;
  }

  const {
    top: fromTop, left: fromLeft, width: fromWidth, height: fromHeight,
  } = fromImage.getBoundingClientRect();
  const {
    top: targetTop, left: toLeft, width: toWidth, height: toHeight,
  } = toImage.getBoundingClientRect();

  let toTop = targetTop;
  if (!isElementInViewport(container)) {
    const { height: windowHeight } = windowSize.get();
    toTop = targetTop < fromTop ? -toHeight : windowHeight;
  }

  const fromTranslateX = (fromLeft + fromWidth / 2) - (toLeft + toWidth / 2);
  const fromTranslateY = (fromTop + fromHeight / 2) - (toTop + toHeight / 2);
  let fromScaleX = fromWidth / toWidth;
  let fromScaleY = fromHeight / toHeight;

  const shouldFadeOut = origin === MediaViewerOrigin.Album || (
    origin === MediaViewerOrigin.Inline && !isMessageImageFullyVisible(container, toImage)
  );

  if (origin === MediaViewerOrigin.SharedMedia) {
    if (fromScaleX > fromScaleY) {
      fromScaleX = fromScaleY;
    } else if (fromScaleY > fromScaleX) {
      fromScaleY = fromScaleX;
    }
  }

  const ghost = createGhost(toImage);
  applyStyles(ghost, {
    top: `${toTop}px`,
    left: `${toLeft}px`,
    width: `${toWidth}px`,
    height: `${toHeight}px`,
    transform: `translate3d(${fromTranslateX}px, ${fromTranslateY}px, 0) scale(${fromScaleX}, ${fromScaleY})`,
  });

  requestAnimationFrame(() => {
    document.body.classList.add('ghost-animating');
    document.body.appendChild(ghost);

    requestAnimationFrame(() => {
      ghost.style.transform = '';
      if (shouldFadeOut) {
        ghost.style.opacity = '0';
      }

      switch (origin) {
        case MediaViewerOrigin.Inline:
          ghost.classList.add('rounded-corners');
          break;

        case MediaViewerOrigin.SharedMedia:
          (ghost.firstChild as HTMLElement).style.objectFit = 'cover';
          break;

        case MediaViewerOrigin.MiddleHeaderAvatar:
        case MediaViewerOrigin.ProfileAvatar:
          ghost.classList.add('circle');
          break;
      }

      setTimeout(() => {
        requestAnimationFrame(() => {
          document.body.removeChild(ghost);
          document.body.classList.remove('ghost-animating');
        });
      }, ANIMATION_DURATION + 100);
    });
  });
}

function createGhost(source: string | HTMLImageElement | HTMLVideoElement) {
  const ghost = document.createElement('div');
  ghost.classList.add('ghost');

  const img = new Image();

  if (typeof source === 'string') {
    img.src = source;
  } else if (source instanceof HTMLVideoElement) {
    img.src = source.poster;
  } else {
    img.src = source.src;
  }

  ghost.appendChild(img);

  return ghost;
}

function uncover(realWidth: number, realHeight: number, top: number, left: number, width: number, height: number) {
  if (realWidth > realHeight) {
    const srcWidth = width;
    width = height * (realWidth / realHeight);
    left -= (width - srcWidth) / 2;
  } else if (realHeight > realWidth) {
    const srcHeight = height;
    height = width * (realHeight / realWidth);
    top -= (height - srcHeight) / 2;
  }

  return {
    top, left, width, height,
  };
}

function isElementInViewport(el: HTMLElement) {
  if (el.style.display === 'none') {
    return false;
  }

  const rect = el.getBoundingClientRect();
  const { height: windowHeight } = windowSize.get();

  return (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
}

function isMessageImageFullyVisible(messageEl: HTMLElement, imageEl: HTMLElement) {
  const container = document.querySelector<HTMLDivElement>('.MessageList')!;
  const imgOffsetTop = messageEl.offsetTop + imageEl.parentElement!.parentElement!.offsetTop;

  return imgOffsetTop > container.scrollTop
    && imgOffsetTop + imageEl.offsetHeight < container.scrollTop + container.offsetHeight;
}

function getTopOffset(hasFooter: boolean) {
  const mql = window.matchMedia(MEDIA_VIEWER_MEDIA_QUERY);
  let topOffsetRem = 4.5;
  if (hasFooter) {
    topOffsetRem += mql.matches ? 1 : 3;
  }

  return topOffsetRem * REM;
}

function applyStyles(element: HTMLElement, styles: Record<string, string>) {
  Object.assign(element.style, styles);
}

function getNodes(message: ApiMessage, origin: MediaViewerOrigin) {
  let containerSelector;
  let mediaSelector;

  switch (origin) {
    case MediaViewerOrigin.Album:
      containerSelector = `#album-media-${message.id}`;
      mediaSelector = '.full-media';
      break;

    case MediaViewerOrigin.SharedMedia:
      containerSelector = `#shared-media${message.id}`;
      mediaSelector = '.full-media';
      break;

    case MediaViewerOrigin.MiddleHeaderAvatar:
      containerSelector = '.MiddleHeader .ChatInfo .Avatar';
      mediaSelector = 'img.avatar-media';
      break;

    case MediaViewerOrigin.ProfileAvatar:
      containerSelector = '#RightColumn .active .Profile > .ChatInfo .Avatar';
      mediaSelector = 'img.avatar-media';
      break;

    case MediaViewerOrigin.Inline:
    default:
      containerSelector = `#message${message.id}`;
      mediaSelector = '.message-content .full-media';
  }

  const container = document.querySelector<HTMLElement>(containerSelector)!;

  return {
    container,
    mediaEl: container && container.querySelector(mediaSelector) as HTMLImageElement | HTMLVideoElement,
  };
}
