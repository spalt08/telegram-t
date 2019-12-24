import React, { FC, useEffect, useState } from '../lib/teact';
import { DEBUG } from '../config';

type IProps = {
  id: string;
  animationData: any;
  width?: number;
  height?: number;
  play?: boolean;
  noLoop?: boolean;
  className?: string;
  thumbnailData?: string;
};

let Lottie: typeof import('lottie-web/build/player/lottie_light');

async function requireLottie() {
  try {
    Lottie = await import('lottie-web/build/player/lottie_light');

    return true;
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error(err);
    }

    return false;
  }
}

const AnimatedSticker: FC<IProps> = ({
  id, animationData, width, height, play, noLoop, className, thumbnailData,
}) => {
  const [animation, setAnimation] = useState(null);
  const [isLottieReady, setIsLottieReady] = useState(false);

  useEffect(() => {
    if (!isLottieReady) {
      requireLottie().then(setIsLottieReady);
    }
  }, [isLottieReady]);

  useEffect(() => {
    if (!animation) {
      return;
    }

    if (play) {
      animation.goToAndPlay(0);
    } else if (play === false) {
      animation.goToAndStop(0);
    }
  }, [play, animation]);

  useEffect(() => {
    if (!animationData || !isLottieReady) {
      return;
    }

    const container = document.getElementById(`sticker:${id}`);
    if (!container) {
      return;
    }

    if (animation) {
      animation.destroy();
    }

    setAnimation(Lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: !noLoop,
      autoplay: false,
      animationData,
    }));
  }, [id, animationData, isLottieReady]);

  const style = width && height
    ? `width: ${width}px; height: ${height}px;`
    : '';

  return (
    <div
      id={`sticker:${id}`}
      className={`AnimatedSticker ${className}`}
      style={style}
    >
      {thumbnailData && !animation && (
        <img src={thumbnailData} width={width} height={height} alt="" />
      )}
    </div>
  );
};

export default AnimatedSticker;
