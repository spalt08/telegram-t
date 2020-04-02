import React, { FC, useEffect } from '../../lib/teact/teact';

import useShowTransition from '../../hooks/useShowTransition';
import captureEscKeyListener from '../../util/captureEscKeyListener';
import buildClassName from '../../util/buildClassName';

import './Menu.scss';

type OwnProps = {
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
}) => {
  const { transitionClassNames } = useShowTransition(isOpen, onCloseAnimationEnd);

  useEffect(() => (isOpen && onClose ? captureEscKeyListener(onClose) : undefined), [isOpen, onClose]);

  const backDropHandler = noCloseOnBackdrop ? undefined : onClose;

  return (
    <div
      className={buildClassName('Menu', className)}
      onKeyDown={isOpen ? onKeyDown : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={isOpen ? onMouseLeave : undefined}
      // @ts-ignore teact feature
      style={style}
    >
      {isOpen && (
        <div className="backdrop" onMouseDown={backDropHandler} />
      )}
      <div
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
