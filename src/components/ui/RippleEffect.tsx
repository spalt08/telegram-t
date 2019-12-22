import React, {
  FC, useCallback, useState, memo,
} from '../../lib/teact';
import { debounce } from '../../util/schedulers';

import './RippleEffect.scss';

interface Ripple {
  x: number;
  y: number;
  size: number;
}

const RIPPLE_DEBOUNCE_MS = 2000;

const runDebounced = debounce((cb) => cb(), RIPPLE_DEBOUNCE_MS, false);

const RippleEffect: FC<{}> = () => {
  const [ripples, setRipples] = useState([]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const container = e.currentTarget as HTMLDivElement;
    const position = container.getBoundingClientRect() as DOMRect;

    const rippleSize = container.offsetWidth / 2;

    setRipples([
      ...ripples,
      {
        x: e.pageX - position.x - (rippleSize / 2),
        y: e.pageY - position.y - (rippleSize / 2),
        size: rippleSize,
      },
    ]);
  }, [ripples]);

  const cleanUp = useCallback(() => runDebounced(() => setRipples([])), []);

  return (
    <div className="ripple-container" onMouseDown={handleMouseDown} onMouseUp={cleanUp}>
      {ripples.map(({ x, y, size }: Ripple) => (
        <span style={`left: ${x}px; top: ${y}px; width: ${size}px; height: ${size}px;`} />
      ))}
    </div>
  );
};

export default memo(RippleEffect);
