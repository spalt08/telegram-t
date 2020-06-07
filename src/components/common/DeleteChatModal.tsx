import React, { FC, useCallback, memo } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { ApiChat } from '../../api/types';
import { GlobalActions } from '../../global/types';

import { selectIsChatWithSelf, selectUser } from '../../modules/selectors';
import {
  isChatPrivate,
  getUserFirstName,
  getPrivateChatUserId,
  isChatBasicGroup,
  isChatSuperGroup,
  isChatChannel,
  getChatTitle,
} from '../../modules/helpers';
import { pick } from '../../util/iteratees';

import Avatar from './Avatar';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

import './DeleteChatModal.scss';

export type OwnProps = {
  isOpen: boolean;
  chat: ApiChat;
  onClose: () => void;
};

type StateProps = {
  isChannel: boolean;
  isChatWithSelf?: boolean;
  isPrivateChat: boolean;
  isGroup: boolean;
  isSuperGroup: boolean;
  canDeleteForAll?: boolean;
  chatTitle: string;
  contactFirstName?: string;
};

type DispatchProps = Pick<GlobalActions, 'leaveChannel' | 'deleteHistory' | 'deleteChannel'>;

const DeleteChatModal: FC<OwnProps & StateProps & DispatchProps> = ({
  isOpen,
  chat,
  isChannel,
  isPrivateChat,
  isChatWithSelf,
  isGroup,
  isSuperGroup,
  canDeleteForAll,
  chatTitle,
  contactFirstName,
  onClose,
  leaveChannel,
  deleteHistory,
  deleteChannel,
}) => {
  const handleDeleteMessageForAll = useCallback(() => {
    deleteHistory({ maxId: chat.lastMessage!.id, shouldDeleteForAll: true });
    onClose();
  }, [deleteHistory, chat.lastMessage, onClose]);

  const handleDeleteChat = useCallback(() => {
    if (isPrivateChat || isGroup) {
      deleteHistory({ maxId: chat.lastMessage!.id, shouldDeleteForAll: false });
    } else if ((isChannel || isSuperGroup) && !chat.isCreator) {
      leaveChannel({ chatId: chat.id });
    } else if ((isChannel || isSuperGroup) && chat.isCreator) {
      deleteChannel({ chatId: chat.id });
    }
    onClose();
  }, [
    isPrivateChat,
    isGroup,
    isChannel,
    isSuperGroup,
    chat.isCreator,
    chat.lastMessage,
    chat.id,
    onClose,
    deleteHistory,
    leaveChannel,
    deleteChannel,
  ]);

  function renderHeader() {
    return (
      <div className="modal-header">
        <Avatar
          size="tiny"
          chat={chat}
          isSavedMessages={isChatWithSelf}
        />
        <h3 className="modal-title">{renderTitle()}</h3>
      </div>
    );
  }

  function renderTitle() {
    if (isChannel && !chat.isCreator) {
      return 'Leave Channel?';
    }

    if (isChannel && chat.isCreator) {
      return 'Delete and Leave Channel?';
    }

    if (isGroup || isSuperGroup) {
      return 'Leave Group?';
    }

    return 'Delete Chat?';
  }

  function renderMessage() {
    if (isChannel && !chat.isCreator) {
      return <p>Are you sure you want to leave channel <strong>{chatTitle}</strong>?</p>;
    }
    if (isChannel && chat.isCreator) {
      return <p>Are you sure you want to delete and leave channel <strong>{chatTitle}</strong>?</p>;
    }

    if (isGroup || isSuperGroup) {
      return <p>Are you sure you want to leave group <strong>{chatTitle}</strong>?</p>;
    }

    return <p>Are you sure you want to delete chat with <strong>{contactFirstName}</strong>?</p>;
  }

  function renderActionText() {
    if (isChannel && !chat.isCreator) {
      return 'Leave Channel';
    }
    if (isChannel && chat.isCreator) {
      return 'Delete and Leave Channel';
    }

    if (isGroup || isSuperGroup) {
      return 'Leave Group';
    }

    return `Delete${canDeleteForAll ? ' just for me' : ''}`;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="DeleteChatModal"
      header={renderHeader()}
    >
      {renderMessage()}
      {canDeleteForAll && (
        <Button color="danger" className="confirm-dialog-button" isText onClick={handleDeleteMessageForAll}>
          Delete for {contactFirstName ? `me and ${contactFirstName}` : 'Everyone'}
        </Button>
      )}
      <Button color="danger" className="confirm-dialog-button" isText onClick={handleDeleteChat}>
        {renderActionText()}
      </Button>
      <Button className="confirm-dialog-button" isText onClick={onClose}>Cancel</Button>
    </Modal>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { chat }): StateProps => {
    const isPrivateChat = isChatPrivate(chat.id);
    const isChatWithSelf = selectIsChatWithSelf(global, chat);
    const canDeleteForAll = (isPrivateChat && !isChatWithSelf);
    const contactFirstName = chat && isChatPrivate(chat.id)
      ? getUserFirstName(selectUser(global, getPrivateChatUserId(chat)!))
      : undefined;

    return {
      isPrivateChat,
      isChatWithSelf,
      isChannel: isChatChannel(chat),
      isGroup: isChatBasicGroup(chat),
      isSuperGroup: isChatSuperGroup(chat),
      canDeleteForAll,
      chatTitle: getChatTitle(chat),
      contactFirstName,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['leaveChannel', 'deleteHistory', 'deleteChannel']),
)(DeleteChatModal));
