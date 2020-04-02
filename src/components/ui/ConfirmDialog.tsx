import React, { FC } from '../../lib/teact/teact';

import Modal from './Modal';
import Button from './Button';

type OwnProps = {
  isOpen: boolean;
  onClose: () => void;
  onCloseAnimationEnd?: () => void;
  text: string;
  confirmLabel?: string;
  confirmHandler: () => void;
  confirmIsDestructive?: boolean;
};

const ConfirmDialog: FC<OwnProps> = ({
  isOpen,
  onClose,
  onCloseAnimationEnd,
  text,
  confirmLabel = 'Confirm',
  confirmHandler,
  confirmIsDestructive,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCloseAnimationEnd={onCloseAnimationEnd}
    >
      <p>{text}</p>
      <Button
        className="confirm-dialog-button"
        isText
        onClick={confirmHandler}
        color={confirmIsDestructive ? 'danger' : 'primary'}
      >
        {confirmLabel}
      </Button>
      <Button className="confirm-dialog-button" isText onClick={onClose}>Cancel</Button>
    </Modal>
  );
};

export default ConfirmDialog;
