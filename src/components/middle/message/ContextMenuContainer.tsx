import React, {
  FC, memo, useCallback, useEffect, useState,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../store/types';
import { ApiMessage } from '../../../api/types';

import { selectChat, selectIsChatWithSelf, selectUser } from '../../../modules/selectors';
import {
  getPrivateChatUserId,
  getUserFirstName, isChannel,
  isPrivateChat, isSuperGroup,
} from '../../../modules/helpers';
import { disableScrolling, enableScrolling } from '../../../util/scrollLock';

import MessageContextMenu from './MessageContextMenu';
import Dialog from '../../ui/Dialog';
import Button from '../../ui/Button';
import useOverlay from '../../../hooks/useOverlay';

import './ContextMenuContainer.scss';

type IAnchorPosition = {
  x: number;
  y: number;
};

type IProps = Pick<GlobalActions, 'setChatReplyingTo' | 'pinMessage' | 'deleteMessages'> & {
  isOpen: boolean;
  message: ApiMessage;
  isChatWithSelf?: boolean;
  canPin?: boolean;
  canDelete?: boolean;
  canDeleteForAll?: boolean;
  anchor: IAnchorPosition;
  contactFirstName: string;
  closeContextMenu: () => void;
  onClose: () => void;
  onCloseAnimationEnd: () => void;
};

const ContextMenuContainer: FC<IProps> = ({
  isOpen,
  message,
  anchor,
  onClose,
  onCloseAnimationEnd,
  contactFirstName,
  canPin,
  canDelete,
  canDeleteForAll,
  setChatReplyingTo,
  pinMessage,
  deleteMessages,
}) => {
  const { overlayClassNames, handleCloseAnimationEnd } = useOverlay(isOpen, onCloseAnimationEnd);
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
    pinMessage({ chatId: message.chat_id, messageId: message.id });
    closeMenu();
  }, [pinMessage, message, closeMenu]);

  const handleDeleteMessageForAll = useCallback(() => {
    deleteMessages({ chatId: message.chat_id, messageIds: [message.id], shouldDeleteForAll: true });
    closeDeleteDialog();
  }, [deleteMessages, message.chat_id, message.id, closeDeleteDialog]);

  const handleDeleteMessageForSelf = useCallback(() => {
    deleteMessages({ chatId: message.chat_id, messageIds: [message.id], shouldDeleteForAll: false });
    closeDeleteDialog();
  }, [deleteMessages, message.chat_id, message.id, closeDeleteDialog]);

  useEffect(() => {
    disableScrolling();

    return enableScrolling;
  }, []);

  return (
    <div
      className={['ContextMenuContainer', ...overlayClassNames].join(' ')}
      onTransitionEnd={handleCloseAnimationEnd}
    >
      <MessageContextMenu
        message={message}
        isOpen={isMenuOpen}
        anchor={anchor}
        canPin={canPin}
        canDelete={canDelete}
        onReply={handleReply}
        onPin={handlePin}
        onDelete={handleDelete}
        onClose={closeMenu}
      />
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        className="delete"
        title="Delete Message?"
        transparentBackdrop
      >
        <p>Are you sure you want to delete message?</p>
        {canDeleteForAll && (
          <Button color="danger" className="button" isText onClick={handleDeleteMessageForAll}>
            Delete for {contactFirstName ? `me and ${contactFirstName}` : 'Everyone'}
          </Button>
        )}
        <Button color="danger" className="button" isText onClick={handleDeleteMessageForSelf}>
          Delete{canDeleteForAll ? ' just for me' : ''}
        </Button>
        <Button className="button" isText onClick={closeDeleteDialog}>Cancel</Button>
      </Dialog>
    </div>
  );
};

export default memo(withGlobal(
  (global, { message }: IProps) => {
    const chat = selectChat(global, message.chat_id);
    const isPrivate = isPrivateChat(chat.id);
    const isChatWithSelf = isPrivate && selectIsChatWithSelf(global, chat);
    const isSuperGroupOrChannel = isSuperGroup(chat) || isChannel(chat);
    const isAdminOrOwner = !isPrivate && true; // TODO Implement.
    const isOwnMessage = true; // TODO Implement.

    const canPin = isChatWithSelf || isAdminOrOwner;
    const canDelete = isOwnMessage || !isSuperGroupOrChannel || isAdminOrOwner;
    const canDeleteForAll = canDelete && ((isPrivate && !isChatWithSelf) || isAdminOrOwner);

    const contactFirstName = isPrivateChat(chat.id)
      ? getUserFirstName(selectUser(global, getPrivateChatUserId(chat)!))
      : null;

    return {
      contactFirstName,
      canPin,
      canDelete,
      canDeleteForAll,
    };
  },
  (setGlobal, actions) => {
    const { setChatReplyingTo, pinMessage, deleteMessages } = actions;
    return { setChatReplyingTo, pinMessage, deleteMessages };
  },
)(ContextMenuContainer));
