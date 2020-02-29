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
  noCloseOnBackdrop?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<any>) => void;
  onCloseAnimationEnd?: () => void;
  onClose?: () => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
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
    noCloseOnBackdrop = false,
    onKeyDown,
    onCloseAnimationEnd,
    onClose,
    onMouseEnter,
    onMouseLeave,
  } = props;
  const { transitionClassNames } = useShowTransition(isOpen, onCloseAnimationEnd);
  const bubbleClassNames = [
    'bubble', 'menu-container', 'custom-scroll', positionY, positionX, transitionClassNames,
  ].join(' ');

  useEffect(() => (isOpen && onClose ? captureEscKeyListener(onClose) : undefined), [isOpen, onClose]);
  const backDropHandler = noCloseOnBackdrop ? undefined : onClose;

  return (
    <div
      className={`Menu ${className || ''}`}
      onKeyDown={isOpen ? onKeyDown : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={isOpen ? onMouseLeave : undefined}
      // @ts-ignore teact feature
      style={style}
    >
      {isOpen && (
        <div className="backdrop" onMouseDown={backDropHandler} />
      )}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className={bubbleClassNames}
        // @ts-ignore teact feature
        style={`transform-origin: ${positionY} ${positionX}`}
        onClick={autoClose ? onClose : undefined}
      >
        {children}
      </div>
    </div>
  );
};

export default Menu;
