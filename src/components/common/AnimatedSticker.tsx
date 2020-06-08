import { AnimationItem } from 'lottie-web';
import React, {
  FC, useEffect, useRef, useState, memo,
} from '../../lib/teact/teact';

import { fastRaf } from '../../util/schedulers';

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
  const [animation, setAnimation] = useState<AnimationItem>();
  const container = useRef<HTMLDivElement>();
  const prevPlaySegment = useRef<number[]>();

  useEffect(() => {
    if (animation || !animationData) {
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

      setAnimation(newAnimation);

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
  }, [animation, animationData, noLoop, speed, onLoad]);

  useEffect(() => {
    return () => {
      if (animation) {
        animation.destroy();
      }
    };
  }, [animation]);

  useEffect(() => {
    if (!animation) {
      return;
    }

    if (play) {
      animation.play();
      // animation.goToAndPlay(0);
    } else {
      animation.pause();
      // animation.goToAndStop(0);
    }
  }, [play, animation]);

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
