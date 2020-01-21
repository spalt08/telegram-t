import React, {
  FC, useEffect, useState,
} from '../../lib/teact/teact';

import './Modal.scss';

interface IProps {
  isOpen: boolean;
  title: string;
  className?: string;
  children: any;
  onDismiss: () => void;
}

const Modal: FC<IProps> = (props) => {
  const {
    isOpen,
    title,
    className,
    children,
    onDismiss,
  } = props;
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsShown(true);
    } else {
      setTimeout(() => setIsShown(false), 150);
    }
  }, [isOpen]);

  let modalClassName = 'Modal';

  if (isOpen) {
    modalClassName += ' open';
  }

  if (isShown) {
    modalClassName += ' shown';
  }

  return (
    <div className={`${modalClassName} ${className || ''}`}>
      <div>
        <div className="modal-backdrop" onClick={onDismiss} />
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
