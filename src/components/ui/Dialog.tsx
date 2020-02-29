import React, { FC, useEffect } from '../../lib/teact/teact';

import useShowTransition from '../../hooks/useShowTransition';
import captureEscKeyListener from '../../util/captureEscKeyListener';
import buildClassName from '../../util/buildClassName';

import './Dialog.scss';

interface IProps {
  title?: string;
  className?: string;
  isOpen?: boolean;
  transparentBackdrop?: boolean;
  header?: FC;
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
    header,
    children,
    onClose,
    onCloseAnimationEnd,
  } = props;
  const { shouldRender, transitionClassNames } = useShowTransition(isOpen, onCloseAnimationEnd);

  useEffect(() => (isOpen ? captureEscKeyListener(onClose) : undefined), [isOpen, onClose]);

  if (!shouldRender) {
    return null;
  }

  const fullClassName = buildClassName(
    'Dialog',
    className,
    transitionClassNames,
    transparentBackdrop && 'transparent-backdrop',
  );

  return (
    <div className={fullClassName}>
      <div className="container">
        {isOpen && (
          <div className="backdrop" onClick={onClose} />
        )}
        <div className={['dialog', transitionClassNames].join(' ')}>
          {header}
          {!header && title && (
            <div className="title">
              {title}
            </div>
          )}
          <div className="content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
