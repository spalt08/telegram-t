import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiMessage } from '../../api/types';
import { GlobalActions } from '../../global/types';

import { selectAllowedMessagedActions, selectChat, selectUser } from '../../modules/selectors';
import { isChatPrivate, getUserFirstName, getPrivateChatUserId } from '../../modules/helpers';

import Modal from '../ui/Modal';
import Button from '../ui/Button';

export type OwnProps = {
  isOpen: boolean;
  message: ApiMessage;
  onClose: () => void;
};

type StateProps = {
  canDeleteForAll?: boolean;
  contactFirstName?: string;
};

type DispatchProps = Pick<GlobalActions, 'deleteMessages'>;

const DeleteMessageModal: FC<OwnProps & StateProps & DispatchProps> = ({
  isOpen,
  message,
  canDeleteForAll,
  contactFirstName,
  onClose,
  deleteMessages,
}) => {
  const handleDeleteMessageForAll = useCallback(() => {
    deleteMessages({ messageIds: [message.id], shouldDeleteForAll: true });
    onClose();
  }, [deleteMessages, message.id, onClose]);

  const handleDeleteMessageForSelf = useCallback(() => {
    deleteMessages({ messageIds: [message.id], shouldDeleteForAll: false });
    onClose();
  }, [deleteMessages, message.id, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="delete"
      title="Delete Message?"
      transparentBackdrop
    >
      <p>Are you sure you want to delete message?</p>
      {canDeleteForAll && (
        <Button color="danger" className="confirm-dialog-button" isText onClick={handleDeleteMessageForAll}>
          Delete for {contactFirstName ? `me and ${contactFirstName}` : 'Everyone'}
        </Button>
      )}
      <Button color="danger" className="confirm-dialog-button" isText onClick={handleDeleteMessageForSelf}>
        Delete{canDeleteForAll ? ' just for me' : ''}
      </Button>
      <Button className="confirm-dialog-button" isText onClick={onClose}>Cancel</Button>
    </Modal>
  );
};

export default withGlobal<OwnProps>(
  (global, { message }): StateProps => {
    const { canDeleteForAll } = selectAllowedMessagedActions(global, message);
    const chat = selectChat(global, message.chat_id);
    const contactFirstName = chat && isChatPrivate(chat.id)
      ? getUserFirstName(selectUser(global, getPrivateChatUserId(chat)!))
      : undefined;

    return {
      canDeleteForAll,
      contactFirstName,
    };
  },
  (setGlobal, actions): DispatchProps => {
    const { deleteMessages } = actions;
    return { deleteMessages };
  },
)(DeleteMessageModal);
