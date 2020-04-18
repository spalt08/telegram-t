import { ApiMessage } from '../../../api/types';

import {
  getMessageContent,
  getPhotoFullDimensions,
  getVideoDimensions,
} from '../../../modules/helpers';
import {
  REM,
  MEDIA_VIEWER_MEDIA_QUERY,
  calculateDimensions,
  getMediaViewerAvailableDimensions,
} from '../../common/helpers/mediaDimensions';

import windowSize from '../../../util/windowSize';

const ANIMATION_DURATION = 200;

export function animateOpening(message: ApiMessage, hasFooter: boolean, isFromSharedMedia?: boolean) {
  const container = document.getElementById(isFromSharedMedia ? `shared-media${message.id}` : `message${message.id}`)!;
  const fromImage = container.querySelector<HTMLImageElement>('img.full-media, video')!;

  const { width: windowWidth } = windowSize.get();
  const { photo, video, webPage } = getMessageContent(message);
  const mediaSize = video ? getVideoDimensions(video) : getPhotoFullDimensions((photo || webPage!.photo)!);
  const { width: availableWidth, height: availableHeight } = getMediaViewerAvailableDimensions(hasFooter);
  const { width: toWidth, height: toHeight } = calculateDimensions(
    availableWidth, availableHeight, mediaSize!.width, mediaSize!.height,
  );
  const toLeft = (windowWidth - toWidth) / 2;
  const toTop = getTopOffset(hasFooter) + (availableHeight - toHeight) / 2;

  let {
    top: fromTop, left: fromLeft, width: fromWidth, height: fromHeight,
  } = fromImage.getBoundingClientRect();

  if (isFromSharedMedia) {
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

  const ghost = createGhost(fromImage);
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
      }, ANIMATION_DURATION + 50);
    });
  });
}

export function animateClosing(message: ApiMessage, isFromSharedMedia: boolean) {
  const container = document.getElementById(isFromSharedMedia ? `shared-media${message.id}` : `message${message.id}`)!;
  const toImage = container.querySelector<HTMLImageElement>('img.full-media, img.thumbnail, video');
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
  const shouldFadeOut = !isFromSharedMedia && !isMessageFullyVisible(container);

  if (isFromSharedMedia) {
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

      if (isFromSharedMedia) {
        (ghost.firstChild as HTMLElement).style.objectFit = 'cover';
      } else {
        ghost.classList.add('rounded-corners');
      }

      setTimeout(() => {
        requestAnimationFrame(() => {
          document.body.removeChild(ghost);
          document.body.classList.remove('ghost-animating');
        });
      }, ANIMATION_DURATION + 50);
    });
  });
}

function createGhost<T extends HTMLImageElement | HTMLVideoElement>(element: T) {
  const ghost = document.createElement('div');
  ghost.classList.add('ghost');

  const clonedElement = element.cloneNode() as T;
  ['id', 'style', 'width', 'height', 'class'].forEach(((value) => {
    clonedElement.removeAttribute(value);
  }));
  ghost.appendChild(clonedElement);

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

function isMessageFullyVisible(el: HTMLElement) {
  const container = document.querySelector<HTMLDivElement>('.MessageList')!;

  return el.offsetTop > container.scrollTop
    && el.offsetTop + el.offsetHeight < container.scrollTop + container.offsetHeight;
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
