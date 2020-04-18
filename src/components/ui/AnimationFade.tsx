import React, { FC, useRef } from '../../lib/teact/teact';

import useShowTransition from '../../hooks/useShowTransition';
import usePrevious from '../../hooks/usePrevious';

type ChildrenFn = () => any;

type OwnProps = {
  isOpen: boolean;
  id?: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  children: ChildrenFn;
};

const AnimationFade: FC<OwnProps> = ({
  isOpen, id, className, onClick, children,
}) => {
  const { shouldRender, transitionClassNames } = useShowTransition(isOpen, undefined, undefined, 'slow');
  const prevIsOpen = usePrevious(isOpen);
  const prevChildren = usePrevious(children);
  const fromChildrenRef = useRef<ChildrenFn>();

  if (prevIsOpen && !isOpen) {
    fromChildrenRef.current = prevChildren;
  }

  return (
    shouldRender && (
      <div id={id} className={[className, transitionClassNames].join(' ')} onClick={onClick}>
        {isOpen ? children() : fromChildrenRef.current!()}
      </div>
    )
  );
};

export default AnimationFade;
