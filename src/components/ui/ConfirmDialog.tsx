import React, { FC } from '../../lib/teact/teact';

import Dialog from './Dialog';
import Button from './Button';

type IProps = {
  isOpen: boolean;
  onClose: () => void;
  onCloseAnimationEnd?: () => void;
  text: string;
  confirmLabel?: string;
  confirmHandler: () => void;
  confirmIsDestructive?: boolean;
};

const ConfirmDialog: FC<IProps> = ({
  isOpen,
  onClose,
  onCloseAnimationEnd,
  text,
  confirmLabel = 'Confirm',
  confirmHandler,
  confirmIsDestructive,
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} onCloseAnimationEnd={onCloseAnimationEnd}>
      <p>{text}</p>
      <Button
        className="button"
        isText
        onClick={confirmHandler}
        color={confirmIsDestructive ? 'danger' : 'primary'}
      >
        {confirmLabel}
      </Button>
      <Button className="button" isText onClick={onClose}>Cancel</Button>
    </Dialog>
  );
};

export default ConfirmDialog;
