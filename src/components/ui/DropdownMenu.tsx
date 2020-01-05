import React, { FC, useState } from '../../lib/teact';

import Menu from './Menu';
import './DropdownMenu.scss';

const ANIMATION_TIMEOUT = 150;

interface IProps {
  className?: string;
  trigger: FC<{ onClick: () => void; isOpen?: boolean }>;
  positionX?: 'left' | 'right';
  positionY?: 'top' | 'bottom';
  children: any;
  onKeyDown?: (e: React.KeyboardEvent<any>) => void;
}

const DropdownMenu: FC<IProps> = (props) => {
  const {
    trigger,
    className,
    children,
    positionX = 'left',
    positionY = 'top',
    onKeyDown,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [isShown, setIsShown] = useState(false);

  const toggleIsOpen = () => {
    if (isOpen) {
      setTimeout(() => setIsShown(false), ANIMATION_TIMEOUT);
    } else {
      setIsShown(true);
    }

    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent<any>) => {
    if (!onKeyDown || !isOpen) {
      return;
    }

    onKeyDown(e);
  };

  const handleClose = () => {
    setTimeout(() => setIsShown(false), 150);
    setIsOpen(false);
  };

  return (
    <div className={`DropdownMenu ${className || ''}`} onKeyDown={handleKeyDown}>
      {trigger({ onClick: toggleIsOpen, isOpen })}

      <Menu
        isOpen={isOpen}
        isShown={isShown}
        className={className || ''}
        positionX={positionX}
        positionY={positionY}
        onKeyDown={onKeyDown}
        onClose={handleClose}
      >
        {children}
      </Menu>
    </div>
  );
};

export default DropdownMenu;
