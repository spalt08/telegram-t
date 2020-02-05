import React, { FC, useEffect } from '../../lib/teact/teact';

import useShowTransition from '../../hooks/useShowTransition';
import captureEscKeyListener from '../../util/captureEscKeyListener';

import './Dialog.scss';

interface IProps {
  title?: string;
  className?: string;
  isOpen?: boolean;
  transparentBackdrop?: boolean;
  children: any;
  onClose: () => void;
  onCloseAnimationEnd?: () => void;
}

const Dialog: FC<IProps> = (props) => {
  const {
    title,
    className,
    isOpen,
    transparentBackdrop,
    children,
    onClose,
    onCloseAnimationEnd,
  } = props;
  const { isShown, transitionClassNames, handleHideTransitionEnd } = useShowTransition(isOpen, onCloseAnimationEnd);

  useEffect(() => (isOpen ? captureEscKeyListener(onClose) : undefined), [isOpen, onClose]);

  if (!isShown) {
    return null;
  }

  const classNames = ['Dialog', className, 'overlay', ...transitionClassNames];
  if (className) {
    classNames.push(className);
  }
  if (transparentBackdrop) {
    classNames.push('transparent-backdrop');
  }

  return (
    <div className={classNames.join(' ')}>
      <div className="container">
        {isOpen && (
          <div className="backdrop" onClick={onClose} />
        )}
        <div
          className={['dialog', 'overlay', ...transitionClassNames].join(' ')}
          onTransitionEnd={handleHideTransitionEnd}
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
