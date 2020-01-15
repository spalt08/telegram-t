import React, { FC } from '../../lib/teact';

import useOverlay from '../../hooks/useOverlay';

import './Dialog.scss';

interface IProps {
  title: string;
  className?: string;
  isOpen?: boolean;
  children: any;
  onClose: () => void;
  onCloseAnimationEnd?: () => void;
}

const Dialog: FC<IProps> = (props) => {
  const {
    isOpen,
    title,
    className,
    children,
    onClose,
    onCloseAnimationEnd,
  } = props;
  const { isShown, overlayClassNames, handleCloseAnimationEnd } = useOverlay(isOpen, onCloseAnimationEnd);

  if (!isShown) {
    return null;
  }

  return (
    <div className={`Dialog ${className || ''}`}>
      <div className="container">
        {isOpen && (
          <div className="backdrop" onClick={onClose} />
        )}
        <div
          className={['dialog', 'overlay', ...overlayClassNames].join(' ')}
          onTransitionEnd={handleCloseAnimationEnd}
        >
          <div className="header">
            {title}
          </div>
          <div className="content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
