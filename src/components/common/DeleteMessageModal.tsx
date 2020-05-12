import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiMessage } from '../../api/types';
import { GlobalActions } from '../../global/types';

import { selectAllowedMessagedActions, selectChat, selectUser } from '../../modules/selectors';
import {
  isChatPrivate,
  getUserFirstName,
  getPrivateChatUserId,
  isChatBasicGroup,
  isChatSuperGroup,
} from '../../modules/helpers';
import { pick } from '../../util/iteratees';

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
  willDeleteForCurrentUserOnly?: boolean;
  willDeleteForAll?: boolean;
};

type DispatchProps = Pick<GlobalActions, 'deleteMessages'>;

const DeleteMessageModal: FC<OwnProps & StateProps & DispatchProps> = ({
  isOpen,
  message,
  canDeleteForAll,
  contactFirstName,
  willDeleteForCurrentUserOnly,
  willDeleteForAll,
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
      {willDeleteForCurrentUserOnly && (
        <p>This will delete it just for you, not for other participants in the chat.</p>
      )}
      {willDeleteForAll && (
        <p>This will delete it for everyone in this chat.</p>
      )}
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
    const chat = selectChat(global, message.chatId);
    const contactFirstName = chat && isChatPrivate(chat.id)
      ? getUserFirstName(selectUser(global, getPrivateChatUserId(chat)!))
      : undefined;

    const willDeleteForCurrentUserOnly = chat && isChatBasicGroup(chat) && !canDeleteForAll;
    const willDeleteForAll = chat && isChatSuperGroup(chat);

    return {
      canDeleteForAll,
      contactFirstName,
      willDeleteForCurrentUserOnly,
      willDeleteForAll,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['deleteMessages']),
)(DeleteMessageModal);
