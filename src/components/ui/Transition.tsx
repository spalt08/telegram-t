import React, {
  FC, useLayoutEffect, useRef,
} from '../../lib/teact/teact';

import usePrevious from '../../hooks/usePrevious';

import './Transition.scss';

type ChildrenFn = () => any;
type IProps = {
  activeKey: any;
  name: 'slide' | 'slow-slide' | 'slide-fade' | 'zoom-fade' | 'scroll-slide' | 'fade';
  direction?: 'auto' | 'inverse' | 1 | -1;
  renderCount?: number;
  shouldRestoreHeight?: boolean;
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
  fade: 150,
};
const END_DELAY = 50;

const Transition: FC<IProps> = ({
  activeKey,
  name,
  direction = 'auto',
  renderCount,
  shouldRestoreHeight,
  onStart,
  onStop,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const rendersRef = useRef<Record<number, ChildrenFn>>({});
  const prevActiveKey = usePrevious<any>(activeKey);
  const activateTimeoutRef = useRef<number>();

  const activeKeyChanged = prevActiveKey !== null && activeKey !== prevActiveKey;

  if (!renderCount && activeKeyChanged) {
    rendersRef.current = {
      [prevActiveKey]: rendersRef.current[prevActiveKey],
    };
  }

  rendersRef.current[activeKey] = children;

  useLayoutEffect(() => {
    const container = containerRef.current!;

    const childElements = container.children;
    if (childElements.length === 1) {
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
  }, [activeKey, activeKeyChanged, direction, name, onStart, onStop, prevActiveKey, renderCount, shouldRestoreHeight]);

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

  return (
    <div ref={containerRef} className={['Transition', name].join(' ')}>
      {contents}
    </div>
  );
};

export default Transition;
