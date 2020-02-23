import React, { FC, useRef, useState } from '../../lib/teact/teact';

import usePrevious from '../../hooks/usePrevious';

import './Transition.scss';

type ChildrenFn = () => any;
type IProps = {
  activeKey: any;
  name: 'slide' | 'slide-up';
  direction?: 'auto' | 'inverse' | 1 | -1;
  children: ChildrenFn;
};

// For some reason the event is fired sooner than it should.
const ANIMATION_END_DELAY = 50;

const Transition: FC<IProps> = ({
  activeKey,
  name,
  direction = 'auto',
  children,
}) => {
  const prevChildren = usePrevious<ChildrenFn>(children);
  const prevActiveKey = usePrevious<any>(activeKey);

  const fromChildrenRef = useRef<ChildrenFn>();
  const fromActiveKeyRef = useRef<any>();

  const isAppendStageRef = useRef<any>();
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const handleAnimationEnd = () => {
    setTimeout(() => {
      isAppendStageRef.current = false;
      setIsAnimating(false);
    }, ANIMATION_END_DELAY);
  };

  const activeKeyChanged = prevActiveKey !== null && activeKey !== prevActiveKey;

  if (activeKeyChanged) {
    fromChildrenRef.current = prevChildren;
    fromActiveKeyRef.current = prevActiveKey;
    isAppendStageRef.current = true;
    setIsAnimating(true);
  }

  const contents = isAppendStageRef.current
    ? Array.prototype.concat(fromChildrenRef.current!(), children())
    : children();

  const isBackwards = isAppendStageRef.current && (
    direction === -1
    || (direction === 'auto' && Number(fromActiveKeyRef.current) > Number(activeKey))
    || (direction === 'inverse' && Number(fromActiveKeyRef.current) < Number(activeKey))
  );

  const className = [
    'Transition',
    isAppendStageRef.current ? name : '',
    isAnimating ? 'animating' : '',
    isBackwards ? 'backwards' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={className} onAnimationEnd={handleAnimationEnd}>
      {contents}
    </div>
  );
};

export default Transition;
