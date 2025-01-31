import { MouseEvent as ReactMouseEvent } from 'react';
import React, {
  FC, memo, useCallback, useEffect, useRef, useState,
} from '../../lib/teact/teact';

import { ApiMediaFormat, ApiSticker } from '../../api/types';

import useMedia from '../../hooks/useMedia';
import useTransitionForMedia from '../../hooks/useTransitionForMedia';
import webpHero from '../../util/webpHero';
import buildClassName from '../../util/buildClassName';

import AnimatedSticker from './AnimatedSticker';
import Button from '../ui/Button';

import './StickerButton.scss';

type OwnProps = {
  sticker: ApiSticker;
  load: boolean;
  title?: string;
  className?: string;
  onClick: (sticker: ApiSticker) => void;
  onUnfaveClick?: (sticker: ApiSticker) => void;
};

const StickerButton: FC<OwnProps> = ({
  sticker, load, title, className, onClick, onUnfaveClick,
}) => {
  const ref = useRef<HTMLDivElement>();

  const { isAnimated } = sticker;
  const localMediaHash = `sticker${sticker.id}`;
  const stickerSelector = `sticker-button-${sticker.id}`;

  const previewBlobUrl = useMedia(`${localMediaHash}?size=m`, !load, ApiMediaFormat.BlobUrl);
  const { transitionClassNames } = useTransitionForMedia(previewBlobUrl, 'slow');

  const [shouldPlay, setShouldPlay] = useState(false);
  const lottieData = useMedia(localMediaHash, !shouldPlay, ApiMediaFormat.Lottie);
  const [isAnimationLoaded, setIsAnimationLoaded] = useState(false);
  const handleAnimationLoad = useCallback(() => setIsAnimationLoaded(true), []);
  const canAnimatedPlay = isAnimationLoaded && shouldPlay;

  const play = isAnimated ? () => {
    setShouldPlay(true);
  } : undefined;

  const stop = isAnimated ? () => {
    setShouldPlay(false);
    setIsAnimationLoaded(false);
  } : undefined;

  useEffect(() => {
    if (!shouldPlay) {
      return undefined;
    }

    function handleMouseMove(e: MouseEvent) {
      const buttonElement = e.target && (e.target as HTMLElement).closest('.StickerButton');
      if (stop && buttonElement !== ref.current) {
        stop();
      }
    }

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [shouldPlay, stop]);

  useEffect(() => {
    if (!canAnimatedPlay && previewBlobUrl) {
      webpHero({
        selectors: `.${stickerSelector}`,
      });
    }
  }, [canAnimatedPlay, previewBlobUrl, stickerSelector]);

  const handleClick = useCallback(
    () => onClick({
      ...sticker,
      localMediaHash,
    }),
    [onClick, sticker, localMediaHash],
  );

  const handleUnfaveClick = useCallback((e: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (onUnfaveClick) {
      e.stopPropagation();
      e.preventDefault();

      onUnfaveClick(sticker);
    }
  }, [onUnfaveClick, sticker]);

  const fullClassName = buildClassName(
    'StickerButton',
    stickerSelector,
    className,
    transitionClassNames,
  );

  const style = previewBlobUrl && !canAnimatedPlay ? `background-image: url(${previewBlobUrl})` : '';

  return (
    <div
      ref={ref}
      className={fullClassName}
      title={title || (sticker && sticker.emoji)}
      // @ts-ignore
      style={style}
      onClick={handleClick}
      onMouseMove={play}
      onMouseLeave={stop}
    >
      {shouldPlay && lottieData && (
        <AnimatedSticker
          animationData={lottieData}
          play
          onLoad={handleAnimationLoad}
        />
      )}
      {onUnfaveClick && (
        <Button
          className="sticker-unfave-button"
          color="dark"
          ariaLabel="Remove from Favorites"
          round
          onClick={handleUnfaveClick}
        >
          <i className="icon-close" />
        </Button>
      )}
    </div>
  );
};

export default memo(StickerButton);
