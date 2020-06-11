import React, { FC } from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';

import Button, { OwnProps as ButtonProps } from './Button';

import './FloatingActionButton.scss';

type OwnProps = {
  show: boolean;
  className?: string;
  color?: ButtonProps['color'];
  ariaLabel?: ButtonProps['ariaLabel'];
  disabled?: boolean;
  onClick: () => void;
  children: any;
};

const FloatingActionButton: FC<OwnProps> = ({
  show,
  className,
  color = 'primary',
  ariaLabel,
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
      ariaLabel={ariaLabel}
    >
      {children}
    </Button>
  );
};

export default FloatingActionButton;
