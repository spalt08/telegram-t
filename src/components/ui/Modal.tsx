import React, { FC, useEffect, useRef } from '../../lib/teact/teact';

import useShowTransition from '../../hooks/useShowTransition';
import captureEscKeyListener from '../../util/captureEscKeyListener';
import trapFocus from '../../util/trapFocus';
import buildClassName from '../../util/buildClassName';

import Button from './Button';
import Portal from './Portal';

import './Modal.scss';

type OwnProps = {
  title?: string;
  className?: string;
  isOpen?: boolean;
  header?: FC;
  hasCloseButton?: boolean;
  transparentBackdrop?: boolean;
  children: any;
  onClose: () => void;
  onCloseAnimationEnd?: () => void;
};

const Modal: FC<OwnProps> = (props) => {
  const {
    title,
    className,
    isOpen,
    header,
    hasCloseButton,
    transparentBackdrop,
    children,
    onClose,
    onCloseAnimationEnd,
  } = props;
  const { shouldRender, transitionClassNames } = useShowTransition(isOpen, onCloseAnimationEnd);
  const modalRef = useRef<HTMLDivElement>();

  useEffect(() => (isOpen ? captureEscKeyListener(onClose) : undefined), [isOpen, onClose]);
  useEffect(() => (isOpen && modalRef.current ? trapFocus(modalRef.current) : undefined), [isOpen]);

  useEffect(() => {
    document.body.classList.toggle('has-open-dialog', isOpen);
  }, [isOpen]);

  if (!shouldRender) {
    return undefined;
  }

  function renderHeader() {
    if (header) {
      return header;
    }

    if (!title) {
      return undefined;
    }

    return (
      <div className="modal-header">
        {hasCloseButton && (
          <Button
            round
            color="translucent"
            size="smaller"
            ariaLabel="Close"
            onClick={onClose}
          >
            <i className="icon-close" />
          </Button>
        )}
        <div className="modal-title">{title}</div>
      </div>
    );
  }

  const fullClassName = buildClassName(
    'Modal',
    className,
    transitionClassNames,
    transparentBackdrop && 'transparent-backdrop',
  );

  return (
    <Portal>
      <div
        ref={modalRef}
        className={fullClassName}
        tabIndex={-1}
        role="dialog"
      >
        <div className="modal-container">
          <div className="modal-backdrop" onClick={onClose} />
          <div className="modal-dialog">
            {renderHeader()}
            <div className="modal-content">
              {children}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
