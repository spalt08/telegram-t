import React, {
  FC, useCallback, useMemo, useRef, useState,
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
const MAX_ACTUAL_DELAY_MS = 200;

const RippleEffect: FC<{ delayed?: boolean }> = ({ delayed = false }) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const lastClickAtRef = useRef<number>();

  const cleanUpDebounced = useMemo(() => {
    return debounce(() => {
      setRipples([]);
    }, ANIMATION_DURATION_MS, false);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.button !== 0) {
      return;
    }

    const container = e.currentTarget as HTMLDivElement;
    const position = container.getBoundingClientRect() as DOMRect;

    const rippleSize = container.offsetWidth / 2;
    const exec = () => {
      setRipples([
        ...ripples,
        {
          x: e.clientX - position.x - (rippleSize / 2),
          y: e.clientY - position.y - (rippleSize / 2),
          size: rippleSize,
        },
      ]);

      requestAnimationFrame(() => {
        cleanUpDebounced();
      });
    };

    if (delayed) {
      lastClickAtRef.current = Date.now();
      setTimeout(() => {
        if (Date.now() - lastClickAtRef.current! > MAX_ACTUAL_DELAY_MS) {
          return;
        }

        exec();
      }, DELAY_MS);
    } else {
      exec();
    }
  }, [delayed, ripples, cleanUpDebounced]);

  return (
    <div className="ripple-container" onMouseDown={handleMouseDown}>
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
