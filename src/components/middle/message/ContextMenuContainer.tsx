import React, {
  FC, memo, useCallback, useEffect, useState,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiMessage } from '../../../api/types';

import {
  selectAllowedMessagedActions,
  selectChat,
  selectUser,
} from '../../../modules/selectors';
import {
  getPrivateChatUserId,
  getUserFirstName,
  isChatPrivate,
} from '../../../modules/helpers';
import { disableScrolling, enableScrolling } from '../../../util/scrollLock';

import MessageContextMenu from './MessageContextMenu';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import useShowTransition from '../../../hooks/useShowTransition';

import './ContextMenuContainer.scss';

type IAnchorPosition = {
  x: number;
  y: number;
};

type IProps = {
  isOpen: boolean;
  message: ApiMessage;
  anchor: IAnchorPosition;
  onClose: () => void;
  onCloseAnimationEnd: () => void;
  canReply?: boolean;
  canPin?: boolean;
  canDelete?: boolean;
  canDeleteForAll?: boolean;
  contactFirstName: string;
  closeContextMenu: () => void;
} & Pick<GlobalActions, 'setChatReplyingTo' | 'pinMessage' | 'deleteMessages' | 'openForwardMenu'>;

const ContextMenuContainer: FC<IProps> = ({
  isOpen,
  message,
  anchor,
  onClose,
  onCloseAnimationEnd,
  canReply,
  canPin,
  canDelete,
  canDeleteForAll,
  contactFirstName,
  setChatReplyingTo,
  pinMessage,
  deleteMessages,
  openForwardMenu,
}) => {
  const { transitionClassNames } = useShowTransition(isOpen, onCloseAnimationEnd, undefined, false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = useCallback(() => {
    setIsMenuOpen(false);
    setIsDeleteDialogOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    onClose();
  }, [onClose]);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    onClose();
  }, [onClose]);

  const handleReply = useCallback(() => {
    setChatReplyingTo({ chatId: message.chat_id, messageId: message.id });
    closeMenu();
  }, [setChatReplyingTo, message, closeMenu]);

  const handlePin = useCallback(() => {
    pinMessage({ messageId: message.id });
    closeMenu();
  }, [pinMessage, message, closeMenu]);

  const handleForward = useCallback(() => {
    openForwardMenu({ fromChatId: message.chat_id, messageIds: [message.id] });
    closeMenu();
  }, [openForwardMenu, message, closeMenu]);

  const handleDeleteMessageForAll = useCallback(() => {
    deleteMessages({ messageIds: [message.id], shouldDeleteForAll: true });
    closeDeleteDialog();
  }, [deleteMessages, message.id, closeDeleteDialog]);

  const handleDeleteMessageForSelf = useCallback(() => {
    deleteMessages({ messageIds: [message.id], shouldDeleteForAll: false });
    closeDeleteDialog();
  }, [deleteMessages, message.id, closeDeleteDialog]);

  useEffect(() => {
    disableScrolling();

    return enableScrolling;
  }, []);

  return (
    <div className={['ContextMenuContainer', transitionClassNames].join(' ')}>
      <MessageContextMenu
        message={message}
        isOpen={isMenuOpen}
        anchor={anchor}
        canReply={canReply}
        canPin={canPin}
        canDelete={canDelete}
        onReply={handleReply}
        onPin={handlePin}
        onForward={handleForward}
        onDelete={handleDelete}
        onClose={closeMenu}
      />
      <Modal
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
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
        <Button className="confirm-dialog-button" isText onClick={closeDeleteDialog}>Cancel</Button>
      </Modal>
    </div>
  );
};

export default memo(withGlobal(
  (global, { message }: IProps) => {
    const {
      canReply, canPin, canDelete, canDeleteForAll,
    } = selectAllowedMessagedActions(global, message);
    const chat = selectChat(global, message.chat_id);
    const contactFirstName = isChatPrivate(chat.id)
      ? getUserFirstName(selectUser(global, getPrivateChatUserId(chat)!))
      : null;

    return {
      canReply,
      canPin,
      canDelete,
      canDeleteForAll,
      contactFirstName,
    };
  },
  (setGlobal, actions) => {
    const {
      setChatReplyingTo, pinMessage, deleteMessages, openForwardMenu,
    } = actions;
    return {
      setChatReplyingTo, pinMessage, deleteMessages, openForwardMenu,
    };
  },
)(ContextMenuContainer));
