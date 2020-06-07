import React, { FC } from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';

import Button, { OwnProps as ButtonProps } from './Button';

import './FloatingActionButton.scss';

type OwnProps = {
  show: boolean;
  className?: string;
  color?: ButtonProps['color'];
  disabled?: boolean;
  onClick: () => void;
  children: any;
};

const FloatingActionButton: FC<OwnProps> = ({
  show,
  className,
  color = 'primary',
  disabled,
  onClick,
  children,
}) => {
  const buttonClassName = buildClassName(
    'FloatingActionButton',
    show && 'revealed',
    className,
  );

  return (
    <Button
      className={buttonClassName}
      color={color}
      round
      disabled={disabled}
      onClick={show && !disabled ? onClick : undefined}
    >
      {children}
    </Button>
  );
};

export default FloatingActionButton;
