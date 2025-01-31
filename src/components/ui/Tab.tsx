import React, {
  FC, useLayoutEffect, useRef, memo,
} from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';

import './Tab.scss';

type OwnProps = {
  className?: string;
  title: string;
  active?: boolean;
  badgeCount?: number;
  isBadgeActive?: boolean;
  previousActiveTab: number | null;
  onClick: (arg: number) => void;
  clickArg: number;
};

const Tab: FC<OwnProps> = ({
  className,
  title,
  active,
  badgeCount,
  isBadgeActive,
  previousActiveTab,
  onClick,
  clickArg,
}) => {
  const tabRef = useRef<HTMLButtonElement>();

  useLayoutEffect(() => {
    if (!active || previousActiveTab === null) {
      return;
    }

    const tab = tabRef.current!;
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
  }, [active, previousActiveTab]);

  return (
    <button
      type="button"
      className={buildClassName('Tab', className, active && 'active')}
      onClick={() => onClick(clickArg)}
      ref={tabRef}
    >
      <span>
        {title}
        {!!badgeCount && (
          <span className={buildClassName('badge', isBadgeActive && 'active')}>{badgeCount}</span>
        )}
        <i />
      </span>
    </button>
  );
};

export default memo(Tab);
