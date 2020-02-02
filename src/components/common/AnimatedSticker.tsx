import React, {
  FC, useEffect, useLayoutEffect, useRef, useState,
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

type Lottie = typeof import('lottie-web/build/player/lottie_light').default;
let lottie: Lottie;

async function requireLottie() {
  try {
    lottie = await import('lottie-web/build/player/lottie_light') as unknown as Lottie;
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
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
  const [animation, setAnimation] = useState(null);
  const container = useRef<HTMLDivElement>();
  const prevPlaySegment = useRef<number[]>();

  useLayoutEffect(() => {
    if (animation || !animationData) {
      return;
    }

    requireLottie().then(() => {
      if (!container.current) {
        return;
      }

      setAnimation(lottie.loadAnimation({
        container: container.current,
        renderer: 'svg',
        loop: !noLoop,
        autoplay: false,
        animationData,
      }));
    });
  }, [animationData, animation, noLoop]);

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
