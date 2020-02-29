import React, { FC } from '../../lib/teact/teact';
import useShowTransition from '../../hooks/useShowTransition';

import './Modal.scss';

interface IProps {
  isOpen: boolean;
  title: string;
  className?: string;
  children: any;
  onDismiss: () => void;
  onCloseAnimationEnd?: () => void;
}

const Modal: FC<IProps> = (props) => {
  const {
    isOpen,
    title,
    className,
    children,
    onDismiss,
    onCloseAnimationEnd,
  } = props;
  const { transitionClassNames } = useShowTransition(isOpen, onCloseAnimationEnd);

  return (
    <div className={['Modal', className, transitionClassNames].join(' ')}>
      <div className="modal-container">
        {isOpen && (
          <div className="modal-backdrop" onClick={onDismiss} />
        )}
        <div className="modal-dialog">
          <div className="modal-header">
            <div
              className="modal-close"
              onClick={onDismiss}
              role="button"
              tabIndex={0}
              title="Close Modal"
            >
              <i className="icon-close" />
            </div>
            <h2>{title}</h2>
          </div>
          <div className="modal-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
