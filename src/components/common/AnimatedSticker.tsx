import { AnimationItem } from 'lottie-web';
import React, {
  FC, useEffect, useRef, memo,
} from '../../lib/teact/teact';

import { fastRaf } from '../../util/schedulers';
import useHeavyAnimationCheck from '../../hooks/useHeavyAnimationCheck';
import { ANIMATION_END_DELAY } from '../../config';

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
  const playRef = useRef();
  playRef.current = play;

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

  const restartAnimation = () => {
    if (animationRef.current && playRef.current) {
      animationRef.current.goToAndPlay(0);
    }
  };

  const playAnimation = () => {
    if (animationRef.current && playRef.current) {
      animationRef.current.play();
    }
  };

  const pauseAnimation = () => {
    if (animationRef.current) {
      animationRef.current.pause();
    }
  };

  const pauseNoLoopAnimation = () => {
    const animation = animationRef.current;
    if (animation) {
      animation.pause();
      setTimeout(() => {
        animation.goToAndStop(0);
      }, ANIMATION_END_DELAY);
    }
  };

  useHeavyAnimationCheck(noLoop ? pauseNoLoopAnimation : pauseAnimation, noLoop ? restartAnimation : playAnimation);

  useEffect(() => {
    if (play) {
      if (noLoop) {
        restartAnimation();
      } else {
        playAnimation();
      }
    } else {
      pauseAnimation();
    }
  }, [play, noLoop]);

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
