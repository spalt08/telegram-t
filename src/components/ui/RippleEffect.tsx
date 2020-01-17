import React, {
  FC, useCallback, useEffect, useRef, useState,
} from '../../lib/teact';

import { debounce } from '../../util/schedulers';
import generateIdFor from '../../util/generateIdFor';
import { createTransitionManager } from './TransitionManager';

import './RippleEffect.scss';

const RIPPLE_DEBOUNCE_MS = 2000;

const runDebounced = debounce((cb) => cb(), RIPPLE_DEBOUNCE_MS, false);

const animations = createTransitionManager((transitions: AnyLiteral) => {
  Object.values(transitions).forEach(drawRipple);
});

function drawRipple(state: any) {
  const {
    current: currentSize,
    progress,
    context: {
      canvasContext: ctx,
      rect,
      x,
      y,
    },
  } = state;

  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.beginPath();
  ctx.arc(x, y, currentSize, 0, 2 * Math.PI);
  ctx.fillStyle = `rgba(0, 0, 0, ${0.08 * (1 - progress)})`;
  ctx.fill();
}

const RippleEffect: FC<{}> = () => {
  const [id] = useState(generateIdFor({}));
  const contextRef = useRef<{
    canvasContext: CanvasRenderingContext2D;
    rect: DOMRect;
    size: number;
  }>();

  useEffect(() => {
    requestAnimationFrame(() => {
      const container = document.getElementById(`ripple${id}`) as HTMLCanvasElement;

      contextRef.current = {
        canvasContext: container.getContext('2d')!,
        rect: container.getBoundingClientRect() as DOMRect,
        size: container.offsetWidth / 2,
      };
    });
  }, [id]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (e.button !== 0) {
      return;
    }

    if (!contextRef.current) {
      return;
    }

    const { canvasContext, rect, size } = contextRef.current;

    animations.add({
      prop: 'any',
      from: 0,
      to: size,
      duration: 1000,
      context: {
        canvasContext,
        rect,
        x: e.pageX - rect.x,
        y: e.pageY - rect.y,
      },
    });
  }, []);

  // TODO
  const cleanUp = useCallback(() => runDebounced(() => {
  }), []);

  return (
    <canvas id={`ripple${id}`} className="ripple-container" onMouseDown={handleMouseDown} onMouseUp={cleanUp} />
  );
};

export default RippleEffect;
