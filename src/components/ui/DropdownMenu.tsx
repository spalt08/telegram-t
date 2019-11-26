import React, { FC, JsxChildren, useState } from '../../lib/teact';

import './DropdownMenu.scss';

interface IProps {
  className?: string;
  trigger: FC<{ onClick: () => void }>;
  positionX?: 'left' | 'right';
  positionY?: 'top' | 'bottom';
  children: JsxChildren;
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

  let bubbleClassName = `bubble ${positionY} ${positionX}`;

  if (isOpen) {
    bubbleClassName += ' open';
  }

  if (isShown) {
    bubbleClassName += ' shown';
  }

  const toggleIsOpen = () => {
    if (isOpen) {
      setTimeout(() => setIsShown(false), 150);
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

  return (
    <div className={`DropdownMenu ${className || ''}`} onKeyDown={handleKeyDown}>
      {trigger({ onClick: toggleIsOpen })}
      {isOpen && (
        <div className="backdrop" onClick={toggleIsOpen} />
      )}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <ul className={bubbleClassName} onClick={toggleIsOpen}>
        {children}
      </ul>
    </div>
  );
};

export default DropdownMenu;
