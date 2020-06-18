import React, {
  FC, useLayoutEffect, useRef,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ANIMATION_END_DELAY } from '../../config';
import usePrevious from '../../hooks/usePrevious';
import buildClassName from '../../util/buildClassName';
import { dispatchHeavyAnimationEvent } from '../../hooks/useHeavyAnimationCheck';

import './Transition.scss';

type ChildrenFn = (isActive: boolean) => any;
type OwnProps = {
  activeKey: number;
  name: 'none' | 'slide' | 'mv-slide' | 'slide-fade' | 'zoom-fade' | 'scroll-slide' | 'fade' | 'slide-layers';
  direction?: 'auto' | 'inverse' | 1 | -1;
  renderCount?: number;
  shouldRestoreHeight?: boolean;
  id?: string;
  className?: string;
  onStart?: () => void;
  onStop?: () => void;
  children: ChildrenFn;
};

type StateProps = {
  animationLevel: number;
};

const ANIMATION_DURATION = {
  slide: 350,
  'mv-slide': 400,
  'slide-fade': 400,
  'zoom-fade': 150,
  'scroll-slide': 500,
  'slide-layers': 250,
  fade: 150,
};

const Transition: FC<OwnProps & StateProps> = ({
  activeKey,
  name,
  direction = 'auto',
  renderCount,
  shouldRestoreHeight,
  id,
  className,
  onStart,
  onStop,
  children,
  animationLevel,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const rendersRef = useRef<Record<number, ChildrenFn>>({});
  const prevActiveKey = usePrevious<any>(activeKey);
  const activateTimeoutRef = useRef<number>();

  const activeKeyChanged = prevActiveKey !== null && prevActiveKey !== undefined && activeKey !== prevActiveKey;

  if (!renderCount && activeKeyChanged) {
    rendersRef.current = {
      [prevActiveKey]: rendersRef.current[prevActiveKey],
    };
  }

  rendersRef.current[activeKey] = children;

  useLayoutEffect(() => {
    const container = containerRef.current!;

    const childElements = container.children;
    if (childElements.length === 1 && !activeKeyChanged) {
      childElements[0].classList.add('active');

      return;
    }

    const childNodes = Array.from(container.childNodes);

    if (!activeKeyChanged || !childNodes.length) {
      return;
    }

    if (activateTimeoutRef.current) {
      clearTimeout(activateTimeoutRef.current);
      activateTimeoutRef.current = null;
    }

    const isBackwards = (
      direction === -1
      || (direction === 'auto' && prevActiveKey > activeKey)
      || (direction === 'inverse' && prevActiveKey < activeKey)
    );

    container.classList.remove('animating');
    container.classList.toggle('backwards', isBackwards);

    const keys = Object.keys(rendersRef.current).map(Number);
    const prevActiveIndex = renderCount ? prevActiveKey : keys.indexOf(prevActiveKey);
    const activeIndex = renderCount ? activeKey : keys.indexOf(activeKey);

    if (name === 'none' || animationLevel === 0) {
      childNodes.forEach((node, i) => {
        if (node instanceof HTMLElement) {
          node.classList.remove('from', 'through', 'to');
          node.classList.toggle('active', i === activeIndex);
        }
      });

      return;
    }

    childNodes.forEach((node, i) => {
      if (node instanceof HTMLElement) {
        node.classList.remove('active');
        node.classList.toggle('from', i === prevActiveIndex);
        node.classList.toggle('through', (
          (i > prevActiveIndex && i < activeIndex) || (i < prevActiveIndex && i > activeIndex)
        ));
        node.classList.toggle('to', i === activeIndex);
      }
    });

    if (name === 'scroll-slide') {
      const width = container.offsetWidth;
      container.scrollBy({
        left: activeIndex > prevActiveIndex ? width : -width,
        behavior: 'smooth',
      });
    }

    if (animationLevel > 0) {
      dispatchHeavyAnimationEvent(ANIMATION_DURATION[name] + ANIMATION_END_DELAY);
    }

    requestAnimationFrame(() => {
      container.classList.add('animating');

      activateTimeoutRef.current = window.setTimeout(() => {
        requestAnimationFrame(() => {
          container.classList.remove('animating', 'backwards');

          childNodes.forEach((node, i) => {
            if (node instanceof HTMLElement) {
              node.classList.remove('from', 'through', 'to');
              node.classList.toggle('active', i === activeIndex);
            }
          });

          if (name === 'scroll-slide') {
            container.scrollLeft = activeKey * container.offsetWidth;
          }

          if (shouldRestoreHeight) {
            const activeElement = container.querySelector<HTMLDivElement>('.active');

            if (activeElement) {
              activeElement.style.height = 'auto';
              container.style.height = `${activeElement.clientHeight}px`;
            }
          }

          if (onStop) {
            onStop();
          }
        });
      }, ANIMATION_DURATION[name] + ANIMATION_END_DELAY);

      if (onStart) {
        onStart();
      }
    });
  }, [
    activeKey,
    prevActiveKey,
    activeKeyChanged,
    direction,
    name,
    onStart,
    onStop,
    renderCount,
    shouldRestoreHeight,
    animationLevel,
  ]);

  useLayoutEffect(() => {
    if (shouldRestoreHeight) {
      const container = containerRef.current!;
      const activeElement = container.querySelector<HTMLDivElement>('.active')
        || container.querySelector<HTMLDivElement>('.from');

      if (activeElement) {
        activeElement.style.height = 'auto';
        container.style.height = `${activeElement.clientHeight}px`;
      }
    }
  }, [shouldRestoreHeight, children]);

  const renders = rendersRef.current;
  let contents;
  if (renderCount) {
    contents = [];
    for (let key = 0; key < renderCount; key++) {
      contents.push(renders[key] ? <div key={key}>{renders[key](key === activeKey)}</div> : undefined);
    }
  } else {
    contents = Object.keys(renders).map((key) => (
      <div key={key}>{renders[Number(key)](Number(key) === activeKey)}</div>
    ));
  }

  const fullClassName = buildClassName(
    'Transition',
    className,
    animationLevel === 0 && name === 'scroll-slide' ? 'slide' : name,
  );

  return (
    <div ref={containerRef} id={id} className={fullClassName}>
      {contents}
    </div>
  );
};

export default withGlobal<OwnProps>((global) => {
  const { animationLevel } = global.settings.byKey;
  return { animationLevel };
})(Transition);
