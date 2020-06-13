import { AnimationItem } from 'lottie-web';
import React, {
  FC, useEffect, useRef, memo,
} from '../../lib/teact/teact';

import { fastRaf } from '../../util/schedulers';
import useHeavyAnimationCheck from '../../hooks/useHeavyAnimationCheck';

type OwnProps = {
  animationData: AnyLiteral;
  width?: number;
  height?: number;
  play?: boolean;
  playSegment?: [number, number];
  speed?: number;
  noLoop?: boolean;
  className?: string;
  onLoad?: NoneToVoidFunction;
};

type Lottie = typeof import('lottie-web/build/player/lottie_light').default;
let lottiePromise: Promise<Lottie>;
let lottie: Lottie;

async function ensureLottie() {
  if (!lottiePromise) {
    lottiePromise = import('lottie-web/build/player/lottie_light') as unknown as Promise<Lottie>;
    lottie = await lottiePromise;
  }

  return lottiePromise;
}

const AnimatedSticker: FC<OwnProps> = ({
  animationData,
  width,
  height,
  play,
  noLoop,
  className,
  playSegment,
  speed,
  onLoad,
}) => {
  const animationRef = useRef<AnimationItem>();
  const container = useRef<HTMLDivElement>();
  const prevPlaySegment = useRef<number[]>();

  useEffect(() => {
    if (animationRef.current || !animationData) {
      return;
    }

    const exec = () => {
      if (!container.current) {
        return;
      }

      const newAnimation = lottie.loadAnimation({
        container: container.current,
        renderer: 'svg',
        loop: !noLoop,
        autoplay: false,
        animationData,
      });

      if (speed) {
        newAnimation.setSpeed(speed);
      }

      animationRef.current = newAnimation;

      if (onLoad) {
        onLoad();
      }
    };

    if (lottie) {
      exec();
    } else {
      ensureLottie().then(() => {
        fastRaf(exec);
      });
    }
  }, [animationData, noLoop, speed, onLoad]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, []);

  const playAnimation = () => {
    const animation = animationRef.current;
    if (animation) {
      animation.play();
    }
  };

  const pauseAnimation = () => {
    const animation = animationRef.current;
    if (animation) {
      animation.pause();
    }
  };

  useHeavyAnimationCheck(pauseAnimation, playAnimation);

  useEffect(() => {
    if (play) {
      playAnimation();
    } else {
      pauseAnimation();
    }
  }, [play]);

  useEffect(() => {
    const animation = animationRef.current;

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
  }, [playSegment]);

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

export default memo(AnimatedSticker);
