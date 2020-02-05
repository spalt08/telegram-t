import React, { FC, useEffect } from '../../lib/teact/teact';

import useShowTransition from '../../hooks/useShowTransition';
import captureEscKeyListener from '../../util/captureEscKeyListener';

import './Menu.scss';

interface IProps {
  isOpen: boolean;
  className?: string;
  style?: string;
  positionX?: 'left' | 'right';
  positionY?: 'top' | 'bottom';
  autoClose?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<any>) => void;
  onCloseAnimationEnd?: () => void;
  onClose?: () => void;
  children: any;
}

const Menu: FC<IProps> = (props) => {
  const {
    isOpen,
    className,
    style,
    children,
    positionX = 'left',
    positionY = 'top',
    autoClose = false,
    onKeyDown,
    onCloseAnimationEnd,
    onClose,
  } = props;
  const { transitionClassNames, handleHideTransitionEnd } = useShowTransition(isOpen, onCloseAnimationEnd);
  const bubbleClassNames = ['bubble', positionY, positionX, 'overlay', ...transitionClassNames].join(' ');

  useEffect(() => (isOpen && onClose ? captureEscKeyListener(onClose) : undefined), [isOpen, onClose]);

  return (
    // @ts-ignore
    <div className={`Menu ${className || ''}`} onKeyDown={isOpen ? onKeyDown : undefined} style={style}>
      {isOpen && (
        <div className="backdrop" onClick={onClose} onContextMenu={onClose} />
      )}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <ul
        className={bubbleClassNames}
        onTransitionEnd={handleHideTransitionEnd}
        onClick={autoClose ? onClose : undefined}
      >
        {children}
      </ul>
    </div>
  );
};

export default Menu;
