import React, { FC, useRef } from '../../lib/teact/teact';

import useShowTransition from '../../hooks/useShowTransition';
import usePrevious from '../../hooks/usePrevious';

type ChildrenFn = () => any;

interface IProps {
  isOpen: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  children: ChildrenFn;
}

const AnimationFade: FC<IProps> = ({
  isOpen, className, onClick, children,
}) => {
  const { shouldRender, transitionClassNames } = useShowTransition(isOpen);
  const prevIsOpen = usePrevious(isOpen);
  const prevChildren = usePrevious(children);
  const fromChildrenRef = useRef<ChildrenFn>();

  if (prevIsOpen && !isOpen) {
    fromChildrenRef.current = prevChildren;
  }

  if (isOpen && !prevIsOpen) {
    console.log('transition start show');
    console.time('transition');
  } else if (!isOpen && prevIsOpen) {
    console.log('transition start hide');
    console.time('transition');
  }

  return (
    shouldRender && (
      <div
        className={[className, 'overlay', ...transitionClassNames].join(' ')}
        onClick={onClick}
        onTransitionEnd={() => console.timeEnd('transition')}
      >
        {isOpen ? children() : fromChildrenRef.current!()}
      </div>
    )
  );
};

export default AnimationFade;
