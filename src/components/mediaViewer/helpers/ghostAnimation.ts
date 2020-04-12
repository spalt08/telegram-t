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
  const messageEl = document.getElementById(isFromSharedMedia ? `shared-media${message.id}` : `message${message.id}`);
  if (!messageEl) {
    return;
  }

  const fromImage = messageEl.querySelector('img.full-media,video') as HTMLImageElement;
  if (!fromImage) {
    return;
  }

  const mediaViewerContentEl = document.querySelector('.MediaViewer .media-viewer-content')!;
  const { width: windowWidth } = windowSize.get();
  const { photo, video, webPage } = getMessageContent(message);
  const mediaSize = video ? getVideoDimensions(video) : getPhotoFullDimensions((photo || webPage!.photo)!);
  const { width: availableWidth, height: availableHeight } = getMediaViewerAvailableDimensions(hasFooter);
  const { width: finalWidth, height: finalHeight } = calculateDimensions(
    availableWidth, availableHeight, mediaSize!.width, mediaSize!.height,
  );
  const {
    animatedImage,
    dimensions: {
      width: startWidth, height: startHeight, top: startTop, left: startLeft,
    },
  } = createAnimatedImage(fromImage);
  const finalLeft = (windowWidth - finalWidth) / 2;
  const finalTop = getTopOffset(hasFooter) + (availableHeight - finalHeight) / 2;
  const translateX = (finalWidth - startWidth) / -2;
  const translateY = (finalHeight - startHeight) / -2;
  const scaleX = startWidth / finalWidth;
  const scaleY = startHeight / finalHeight;
  const isFullyVisible = isElementFullyVisible(fromImage);

  applyStyles(animatedImage, {
    width: `${finalWidth}px`,
    height: `${finalHeight}px`,
    transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`,
    opacity: (isFromSharedMedia || !isFullyVisible) ? '0' : '1',
  });

  document.body.style.overflow = 'hidden';
  document.body.appendChild(animatedImage);

  mediaViewerContentEl.classList.add('hide-image');

  requestAnimationFrame(() => {
    const finalTranslateX = startLeft - finalLeft;
    const finalTranslateY = startTop - finalTop;

    animatedImage.classList.add('animate');
    applyStyles(animatedImage, {
      transform: `translate3d(${finalTranslateX * -1}px, ${finalTranslateY * -1}px, 0) scale(1, 1)`,
      opacity: '1',
    });

    setTimeout(() => {
      requestAnimationFrame(() => {
        mediaViewerContentEl.classList.remove('hide-image');
        document.body.removeChild(animatedImage);
      });
    }, ANIMATION_DURATION);
  });
}

export function animateClosing(message: ApiMessage, fromSharedLibrary: boolean) {
  const messageEl = document.getElementById(fromSharedLibrary ? `shared-media${message.id}` : `message${message.id}`);
  const mediaViewerContentEl = document.querySelector('.MediaViewer .active .media-viewer-content')!;
  if (!messageEl || !mediaViewerContentEl) {
    return;
  }

  const fromImage = mediaViewerContentEl.querySelector('img[src],video') as HTMLImageElement;
  const toImage = messageEl.querySelector('img.full-media,img.thumbnail,video') as HTMLImageElement;
  if (!fromImage || !toImage) {
    return;
  }

  const {
    animatedImage,
    dimensions: {
      width: startWidth, height: startHeight, top: startTop, left: startLeft,
    },
  } = createAnimatedImage(fromImage, true);

  document.body.appendChild(animatedImage);

  requestAnimationFrame(() => {
    const {
      width: finalWidth,
      height: finalHeight,
      top: imageTop,
      left: finalLeft,
    } = toImage.getBoundingClientRect();
    const { height: windowHeight } = windowSize.get();
    const finalTop = isElementInViewport(messageEl)
      ? imageTop
      : (imageTop < startTop ? -finalHeight : windowHeight);

    const translateX = finalLeft - startLeft + (finalWidth - startWidth) / 2;
    const translateY = finalTop - startTop + (finalHeight - startHeight) / 2;
    const scaleX = finalWidth / startWidth;
    const scaleY = finalHeight / startHeight;
    const isFullyVisible = isElementFullyVisible(toImage);

    animatedImage.classList.add('animate');
    if (fromSharedLibrary || !isFullyVisible) {
      animatedImage.classList.add('slow');
    }
    applyStyles(animatedImage, {
      transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`,
      opacity: (fromSharedLibrary || !isFullyVisible) ? '0' : '1',
    });

    setTimeout(() => {
      requestAnimationFrame(() => {
        document.body.removeChild(animatedImage);
        document.body.style.overflow = 'visible';
      });
    }, ANIMATION_DURATION);
  });
}

function createAnimatedImage<T extends HTMLImageElement | HTMLVideoElement>(element: T, moveNode = false) {
  const {
    top, left, width: availableWidth, height: availableHeight,
  } = element.getBoundingClientRect();
  const animatedImage = document.createElement('div');
  animatedImage.classList.add('ghost-image');
  applyStyles(animatedImage, {
    top: `${top}px`,
    left: `${left}px`,
    width: `${availableWidth}px`,
    height: `${availableHeight}px`,
  });

  if (moveNode) {
    animatedImage.appendChild(element);
  } else {
    const clonedElement = element.cloneNode() as T;
    ['id', 'style', 'width', 'height', 'class'].forEach(((value) => {
      clonedElement.removeAttribute(value);
    }));
    animatedImage.appendChild(clonedElement);
  }

  return {
    animatedImage,
    dimensions: {
      top, left, width: availableWidth, height: availableHeight,
    },
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

function isElementFullyVisible(el: HTMLElement) {
  if (el.style.display === 'none') {
    return false;
  }

  const messageList = document.getElementById('MessageList')!;
  const rect = el.getBoundingClientRect();
  const listRect = messageList.getBoundingClientRect();

  return (rect.top >= listRect.top && rect.bottom <= listRect.bottom);
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
