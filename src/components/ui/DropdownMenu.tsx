import React, { FC, useState } from '../../lib/teact';

import Menu from './Menu';
import './DropdownMenu.scss';

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

  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent<any>) => {
    if (!onKeyDown || !isOpen) {
      return;
    }

    onKeyDown(e);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className={`DropdownMenu ${className || ''}`} onKeyDown={handleKeyDown}>
      {trigger({ onClick: toggleIsOpen, isOpen })}

      <Menu
        isOpen={isOpen}
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
