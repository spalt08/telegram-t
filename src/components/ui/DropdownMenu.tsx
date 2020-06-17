import React, { FC, useState, useRef } from '../../lib/teact/teact';

import Menu from './Menu';

import './DropdownMenu.scss';

type OwnProps = {
  className?: string;
  trigger: FC<{ onTrigger: () => void; isOpen?: boolean }>;
  positionX?: 'left' | 'right';
  positionY?: 'top' | 'bottom';
  children: any;
};

const DropdownMenu: FC<OwnProps> = (props) => {
  const {
    trigger,
    className,
    children,
    positionX = 'left',
    positionY = 'top',
  } = props;
  const menuRef = useRef<HTMLDivElement>();
  const [isOpen, setIsOpen] = useState(false);

  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent<any>) => {
    const menu = menuRef.current;

    if (!isOpen || e.keyCode !== 40 || !menu) {
      return;
    }

    const focusedElement = document.activeElement;
    const elementChildren = Array.from(menu.children);

    if (!focusedElement || elementChildren.indexOf(focusedElement) === -1) {
      (elementChildren[0] as HTMLElement).focus();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div
      className={`DropdownMenu ${className || ''}`}
      onKeyDown={handleKeyDown}
    >
      {trigger({ onTrigger: toggleIsOpen, isOpen })}

      <Menu
        ref={menuRef}
        isOpen={isOpen}
        className={className || ''}
        positionX={positionX}
        positionY={positionY}
        autoClose
        onClose={handleClose}
      >
        {children}
      </Menu>
    </div>
  );
};

export default DropdownMenu;
