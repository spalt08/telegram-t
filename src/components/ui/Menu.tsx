import { RefObject } from 'react';
import React, { FC, useEffect, useRef } from '../../lib/teact/teact';

import useShowTransition from '../../hooks/useShowTransition';
import useKeyboardListNavigation from '../../hooks/useKeyboardListNavigation';
import captureEscKeyListener from '../../util/captureEscKeyListener';
import buildClassName from '../../util/buildClassName';

import './Menu.scss';

type OwnProps = {
  ref?: RefObject<HTMLDivElement>;
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
};

const Menu: FC<OwnProps> = ({
  ref,
  isOpen,
  className,
  style,
  children,
  positionX = 'left',
  positionY = 'top',
  autoClose = false,
  noCloseOnBackdrop = false,
  onCloseAnimationEnd,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  let menuRef = useRef<HTMLDivElement>();
  if (ref) {
    menuRef = ref;
  }

  const { transitionClassNames } = useShowTransition(isOpen, onCloseAnimationEnd);

  useEffect(() => (isOpen && onClose ? captureEscKeyListener(onClose) : undefined), [isOpen, onClose]);

  const backDropHandler = noCloseOnBackdrop ? undefined : onClose;

  const handleKeyDown = useKeyboardListNavigation(menuRef, isOpen, autoClose ? onClose : undefined);

  return (
    <div
      className={buildClassName('Menu no-selection', className)}
      onKeyDown={isOpen ? handleKeyDown : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={isOpen ? onMouseLeave : undefined}
      // @ts-ignore teact feature
      style={style}
    >
      {isOpen && (
        <div className="backdrop" onMouseDown={backDropHandler} tabIndex={-1} />
      )}
      <div
        ref={menuRef}
        className={buildClassName('bubble menu-container custom-scroll', positionY, positionX, transitionClassNames)}
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
