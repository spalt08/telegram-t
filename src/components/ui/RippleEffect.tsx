import React, {
  FC, useCallback, useMemo, useState,
} from '../../lib/teact/teact';
import { debounce } from '../../util/schedulers';

import './RippleEffect.scss';

interface Ripple {
  x: number;
  y: number;
  size: number;
}

const ANIMATION_DURATION_MS = 700;
// Workaround for flickering when rendering messages. The value is heuristic.
const DELAY_MS = 90;

const RippleEffect: FC<{ delayed?: boolean }> = ({ delayed = false }) => {
  const [ripples, setRipples] = useState([]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.button !== 0) {
      return;
    }

    const container = e.currentTarget as HTMLDivElement;
    const position = container.getBoundingClientRect() as DOMRect;

    const rippleSize = container.offsetWidth / 2;
    const exec = () => setRipples([
      ...ripples,
      {
        x: e.pageX - position.x - (rippleSize / 2),
        y: e.pageY - position.y - (rippleSize / 2),
        size: rippleSize,
      },
    ]);

    if (delayed) {
      setTimeout(() => {
        exec();
      }, DELAY_MS);
    } else {
      exec();
    }
  }, [ripples, delayed]);

  const cleanUp = useMemo(() => {
    return debounce(() => {
      setRipples([]);
    }, ANIMATION_DURATION_MS + DELAY_MS, false);
  }, []);

  return (
    <div className="ripple-container" onMouseDown={handleMouseDown} onMouseUp={cleanUp}>
      {ripples.map(({ x, y, size }: Ripple) => (
        <span
          // @ts-ignore
          style={`left: ${x}px; top: ${y}px; width: ${size}px; height: ${size}px;`}
        />
      ))}
    </div>
  );
};

export default RippleEffect;
