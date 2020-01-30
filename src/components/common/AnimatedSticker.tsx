import React, {
  FC, useEffect, useRef, useState,
} from '../../lib/teact/teact';
import { DEBUG } from '../../config';

type IProps = {
  animationData: AnyLiteral;
  width?: number;
  height?: number;
  play?: boolean;
  playSegment?: number[];
  speed?: number;
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
  animationData,
  width,
  height,
  play,
  noLoop,
  className,
  playSegment,
  speed,
}) => {
  const [isLottieReady, setIsLottieReady] = useState(false);
  const [animation, setAnimation] = useState(null);
  const container = useRef<HTMLDivElement>();
  const prevPlaySegment = useRef<number[]>();

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
    } else {
      animation.goToAndStop(0);
    }
  }, [play, animation]);

  useEffect(() => {
    if (animation || !animationData || !isLottieReady) {
      return;
    }

    if (!container.current) {
      return;
    }

    setAnimation(Lottie.loadAnimation({
      container: container.current,
      renderer: 'svg',
      loop: !noLoop,
      autoplay: false,
      animationData,
    }));
  }, [animationData, isLottieReady, animation, noLoop]);

  useEffect(() => {
    return () => {
      if (animation) {
        animation.destroy();
      }
    };
  }, [animation]);

  useEffect(() => {
    if (
      !animation
      || !playSegment
      || (
        prevPlaySegment.current
        && prevPlaySegment.current[0] === playSegment[0]
        && prevPlaySegment.current[1] === playSegment[1]
      )
    ) {
      return;
    }

    animation.playSegments([playSegment], true);
    prevPlaySegment.current = playSegment;
  }, [playSegment, animation]);

  useEffect(() => {
    if (!animation || !speed) {
      return;
    }

    animation.setSpeed(speed);
  }, [speed, animation]);

  const style = width && height
    ? `width: ${width}px; height: ${height}px;`
    : '';

  return (
    <div
      ref={container}
      className={`AnimatedSticker ${className}`}
      // @ts-ignore
      style={style}
    />
  );
};

export default AnimatedSticker;
