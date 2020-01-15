import React, { FC } from '../../lib/teact';

import useOverlay from '../../hooks/useOverlay';

import './Menu.scss';

interface IProps {
  isOpen: boolean;
  className?: string;
  style?: string;
  positionX?: 'left' | 'right';
  positionY?: 'top' | 'bottom';
  children: any;
  onKeyDown?: (e: React.KeyboardEvent<any>) => void;
  onCloseAnimationEnd?: () => void;
  onClose?: (e: React.MouseEvent<any, MouseEvent>) => void;
}

const Menu: FC<IProps> = (props) => {
  const {
    isOpen,
    className,
    style,
    children,
    positionX = 'left',
    positionY = 'top',
    onKeyDown,
    onCloseAnimationEnd,
    onClose,
  } = props;
  const { overlayClassNames, handleCloseAnimationEnd } = useOverlay(isOpen, onCloseAnimationEnd);

  const bubbleClassNames = ['bubble', positionY, positionX, 'overlay', ...overlayClassNames].join(' ');

  return (
    // @ts-ignore
    <div className={`Menu ${className || ''}`} onKeyDown={isOpen ? onKeyDown : undefined} style={style}>
      {isOpen && (
        <div className="backdrop" onClick={onClose} onContextMenu={onClose} />
      )}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <ul className={bubbleClassNames} onTransitionEnd={handleCloseAnimationEnd}>
        {children}
      </ul>
    </div>
  );
};

export default Menu;
