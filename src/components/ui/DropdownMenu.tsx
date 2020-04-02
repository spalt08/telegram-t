import React, { FC, useState } from '../../lib/teact/teact';

import Menu from './Menu';

import './DropdownMenu.scss';

type OwnProps = {
  className?: string;
  trigger: FC<{ onTrigger: () => void; isOpen?: boolean }>;
  positionX?: 'left' | 'right';
  positionY?: 'top' | 'bottom';
  children: any;
  onKeyDown?: (e: React.KeyboardEvent<any>) => void;
};

const DropdownMenu: FC<OwnProps> = (props) => {
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
      {trigger({ onTrigger: toggleIsOpen, isOpen })}

      <Menu
        isOpen={isOpen}
        className={className || ''}
        positionX={positionX}
        positionY={positionY}
        autoClose
        onKeyDown={onKeyDown}
        onClose={handleClose}
      >
        {children}
      </Menu>
    </div>
  );
};

export default DropdownMenu;
