import React, { FC, useEffect, useState } from '../lib/teact';
import { DEBUG } from '../config';

type IProps = {
  id: string;
  animationData: AnyLiteral;
  width?: number;
  height?: number;
  play?: boolean;
  noLoop?: boolean;
  className?: string;
};

type LottieModule = typeof import('lottie-web/build/player/lottie_light').default;
let Lottie: LottieModule;

async function requireLottie() {
  try {
    Lottie = await import('lottie-web/build/player/lottie_light') as unknown as LottieModule;

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
  id, animationData, width, height, play, noLoop, className,
}) => {
  const [isLottieReady, setIsLottieReady] = useState(false);
  const [animation, setAnimation] = useState(null);

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
    if (animation || !animationData || !isLottieReady) {
      return;
    }

    const container = document.getElementById(`sticker:${id}`);

    if (!container) {
      return;
    }

    setAnimation(Lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: !noLoop,
      autoplay: false,
      animationData,
    }));
  }, [id, animationData, isLottieReady, animation, noLoop]);

  useEffect(() => {
    return () => {
      if (animation) {
        animation.destroy();
      }
    };
  }, [animation]);

  const style = width && height
    ? `width: ${width}px; height: ${height}px;`
    : '';

  return (
    <div
      id={`sticker:${id}`}
      className={`AnimatedSticker ${className}`}
      style={style}
    />
  );
};

export default AnimatedSticker;
