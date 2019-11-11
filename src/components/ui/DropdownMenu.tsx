import React, { FC, JsxChildren, useState } from '../../lib/teact';

import Button from './Button';

import './DropdownMenu.scss';

interface IProps {
  icon: string;
  size?: 'default' | 'smaller';
  color?: 'primary' | 'secondary' | 'translucent';
  positionX?: 'left' | 'right';
  positionY?: 'top' | 'bottom';
  children: JsxChildren;
}

const DropdownMenu: FC<IProps> = (props) => {
  const {
    icon,
    size = 'smaller',
    color = 'translucent',
    children,
    positionX = 'left',
    positionY = 'top',
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [isShown, setIsShown] = useState(false);

  let className = `bubble ${positionY} ${positionX}`;

  if (isOpen) {
    className += ' open';
  }

  if (isShown) {
    className += ' shown';
  }

  const toggleIsOpen = () => {
    if (isOpen) {
      setTimeout(() => setIsShown(false), 150);
    } else {
      setIsShown(true);
    }

    setIsOpen(!isOpen);
  };

  return (
    <div className="DropdownMenu">
      <Button round size={size} color={color} onClick={toggleIsOpen}>
        <i className={`icon-${icon}`} />
      </Button>
      {isOpen && (
        <div className="backdrop" onClick={toggleIsOpen} />
      )}
      <ul className={className}>
        {children}
      </ul>
    </div>
  );
};

export default DropdownMenu;
