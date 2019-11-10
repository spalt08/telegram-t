import React, { FC, JsxChildren, useState } from '../../lib/teact';

import Button from './Button';

import './DropdownMenu.scss';

interface IProps {
  icon: string,
  size?: 'default' | 'smaller',
  color?: 'primary' | 'secondary' | 'translucent',
  positionX?: 'left' | 'right';
  positionY?: 'top' | 'bottom';
  children: JsxChildren,
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
  // TODO Waiting for fix
  // const [isHidden, setIsHidden] = useState(true);

  let className = 'dropdown-bubble';
  className += ` ${positionY} ${positionX}`;
  if (isOpen) {
    className += ' open';
  }
  // TODO Waiting for fix
  // if (isHidden) {
  //   className += ' hidden';
  // }

  const toggleIsOpen = () => {
    // TODO Waiting for fix
    // if (isOpen) {
    //   setTimeout(() => setIsHidden(true), 150);
    // } else {
    //   setIsHidden(false);
    // }
    setIsOpen(!isOpen);
  };

  return (
    <div className="DropdownMenu">
      <Button round size={size} color={color} onClick={toggleIsOpen}>
        <i className={`icon-${icon}`} />
      </Button>
      {isOpen && (
        <div className="dropdown-backdrop" onClick={toggleIsOpen} />
      )}
      <ul className={className}>
        {children}
      </ul>
    </div>
  );
};

export default DropdownMenu;
