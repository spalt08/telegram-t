import React, { FC, useLayoutEffect, useRef } from '../../lib/teact/teact';

import './Tab.scss';

type IProps = {
  className?: string;
  title: string;
  active?: boolean;
  previousActiveTab: number | null;
  onClick?: () => void;
};

const Tab: FC<IProps> = ({
  className,
  title,
  active,
  previousActiveTab,
  onClick,
}) => {
  const tabRef = useRef<HTMLButtonElement>();

  useLayoutEffect(() => {
    if (!active) {
      return;
    }

    const tab = tabRef.current!;
    tab.classList.add('show-indicator');

    if (active && previousActiveTab !== null) {
      const indicator = tab.querySelector('i')!;
      const currentIndicator = tab.parentElement!.children[previousActiveTab].querySelector('i')!;

      currentIndicator.classList.remove('animate');
      indicator.classList.remove('animate');

      // We move and resize our indicator so it repeats the position and size of the previous one.
      const shiftLeft = currentIndicator.parentElement!.offsetLeft - indicator.parentElement!.offsetLeft;
      const scaleFactor = currentIndicator.clientWidth / indicator.clientWidth;
      indicator.style.transform = `translate3d(${shiftLeft}px, 0, 0) scale3d(${scaleFactor}, 1, 1)`;

      requestAnimationFrame(() => {
        // Now we remove the transform to let it animate to its own position and size.
        indicator.classList.add('animate');
        indicator.style.transform = 'none';
      });
    }
  }, [active, previousActiveTab]);

  const fullClassName = ['Tab', className, active && 'active'].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={fullClassName}
      onClick={onClick}
      ref={tabRef}
    >
      <span>
        {title}
        <i />
      </span>
    </button>
  );
};

export default Tab;
