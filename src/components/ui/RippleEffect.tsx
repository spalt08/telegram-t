import React, { FC, useState } from '../../lib/teact';
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

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const container = e.currentTarget as HTMLDivElement;
    const position = container.getBoundingClientRect();

    const rippleSize = container.offsetWidth / 2;

    setRipples([
      ...ripples,
      {
        x: e.pageX - position.x - (rippleSize / 2),
        y: e.pageY - position.y - (rippleSize / 2),
        size: rippleSize,
      },
    ]);
  }

  const cleanUp = runDebounced(() => setRipples([]));

  return (
    <div className="ripple-container" onMouseDown={handleMouseDown} onMouseUp={cleanUp}>
      {ripples.map((ripple: Ripple) => (
        <span style={`left: ${ripple.x}px; top: ${ripple.y}px; width: ${ripple.size}px; height: ${ripple.size}px;`} />
      ))}
    </div>
  );
};

export default RippleEffect;
