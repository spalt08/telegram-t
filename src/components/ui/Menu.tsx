import React, { FC } from '../../lib/teact';

import './Menu.scss';

interface IProps {
  isOpen: boolean;
  isShown: boolean;
  className?: string;
  style?: string;
  positionX?: 'left' | 'right';
  positionY?: 'top' | 'bottom';
  children: any;
  onKeyDown?: (e: React.KeyboardEvent<any>) => void;
  onClose?: (e: React.MouseEvent<any, MouseEvent>) => void;
}

const Menu: FC<IProps> = (props) => {
  const {
    isOpen,
    isShown,
    className,
    style,
    children,
    positionX = 'left',
    positionY = 'top',
    onKeyDown,
    onClose,
  } = props;

  let bubbleClassName = `bubble ${positionY} ${positionX}`;

  if (isOpen) {
    bubbleClassName += ' open';
  }

  if (isShown) {
    bubbleClassName += ' shown';
  }

  const handleKeyDown = (e: React.KeyboardEvent<any>) => {
    if (!onKeyDown || !isOpen) {
      return;
    }

    onKeyDown(e);
  };

  return (
    <div className={`Menu ${className || ''}`} onKeyDown={handleKeyDown} style={style || ''}>
      {isOpen && (
        <div className="backdrop" onClick={onClose} onContextMenu={onClose} />
      )}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <ul className={bubbleClassName} onClick={onClose} onContextMenu={onClose}>
        {children}
      </ul>
    </div>
  );
};

export default Menu;
