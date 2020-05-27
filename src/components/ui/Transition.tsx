import React, {
  FC, useLayoutEffect, useRef,
} from '../../lib/teact/teact';

import usePrevious from '../../hooks/usePrevious';
import buildClassName from '../../util/buildClassName';

import './Transition.scss';

type ChildrenFn = () => any;
type OwnProps = {
  activeKey: any;
  name: 'slide' | 'slow-slide' | 'slide-fade' | 'zoom-fade' | 'scroll-slide' | 'fade' | 'slide-layers';
  direction?: 'auto' | 'inverse' | 1 | -1;
  renderCount?: number;
  shouldRestoreHeight?: boolean;
  shouldSkip?: boolean;
  id?: string;
  className?: string;
  onStart?: () => void;
  onStop?: () => void;
  children: ChildrenFn;
};

const ANIMATION_DURATION = {
  slide: 350,
  'slow-slide': 450,
  'slide-fade': 400,
  'zoom-fade': 150,
  'scroll-slide': 500,
  'slide-layers': 250,
  fade: 150,
};
const END_DELAY = 50;

const Transition: FC<OwnProps> = ({
  activeKey,
  name,
  direction = 'auto',
  renderCount,
  shouldRestoreHeight,
  shouldSkip,
  id,
  className,
  onStart,
  onStop,
  children,
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
    if (activateTimeoutRef.current) {
      clearTimeout(activateTimeoutRef.current);
      activateTimeoutRef.current = null;
    }

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

    if (shouldSkip) {
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
      }, ANIMATION_DURATION[name] + END_DELAY);

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
    shouldSkip,
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
      contents.push(renders[key] ? <div key={key}>{renders[key]()}</div> : undefined);
    }
  } else {
    contents = Object.keys(renders).map((key) => <div key={key}>{renders[Number(key)]()}</div>);
  }

  const fullClassName = buildClassName(
    'Transition',
    className,
    name,
  );

  return (
    <div ref={containerRef} id={id} className={fullClassName}>
      {contents}
    </div>
  );
};

export default Transition;
