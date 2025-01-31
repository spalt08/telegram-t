import React, {
  FC, memo, useCallback, useEffect, useState,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiMessage } from '../../../api/types';
import { IAnchorPosition } from '../../../types';

import { selectAllowedMessagedActions } from '../../../modules/selectors';
import { disableScrolling, enableScrolling } from '../../../util/scrollLock';
import { pick } from '../../../util/iteratees';
import useShowTransition from '../../../hooks/useShowTransition';

import DeleteMessageModal from '../../common/DeleteMessageModal';
import MessageContextMenu from './MessageContextMenu';

import './ContextMenuContainer.scss';

export type OwnProps = {
  isOpen: boolean;
  message: ApiMessage;
  anchor: IAnchorPosition;
  onClose: () => void;
  onCloseAnimationEnd: () => void;
};

type StateProps = {
  canReply?: boolean;
  canPin?: boolean;
  canDelete?: boolean;
  canEdit?: boolean;
  canForward?: boolean;
  canFaveSticker?: boolean;
  canUnfaveSticker?: boolean;
};

type DispatchProps = Pick<GlobalActions, (
  'setChatReplyingTo' | 'setChatEditing' | 'pinMessage' | 'openForwardMenu' |
  'faveSticker' | 'unfaveSticker'
)>;

const TRANSITION_LOCK_CLEAR_DELAY_MS = 50;

const ContextMenuContainer: FC<OwnProps & StateProps & DispatchProps> = ({
  isOpen,
  message,
  anchor,
  onClose,
  onCloseAnimationEnd,
  canReply,
  canPin,
  canDelete,
  canEdit,
  canForward,
  canFaveSticker,
  canUnfaveSticker,
  setChatReplyingTo,
  setChatEditing,
  pinMessage,
  openForwardMenu,
  faveSticker,
  unfaveSticker,
}) => {
  const handleCloseAnimationEnd = useCallback(() => {
    // This reverts MessageList back to `transform` based position after Context Menu has been fully closed
    // `transiton-locked` class is removed with a slight delay to prevent content from jumping while properties change
    document.body.classList.remove('message-list-no-transform');
    setTimeout(() => {
      document.body.classList.remove('transition-locked');
    }, TRANSITION_LOCK_CLEAR_DELAY_MS);
    onCloseAnimationEnd();
  }, [onCloseAnimationEnd]);

  const { transitionClassNames } = useShowTransition(isOpen, handleCloseAnimationEnd, undefined, false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = useCallback(() => {
    setIsMenuOpen(false);
    setIsDeleteModalOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    onClose();
  }, [onClose]);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    onClose();
  }, [onClose]);

  const handleReply = useCallback(() => {
    setChatReplyingTo({ chatId: message.chatId, messageId: message.id });
    closeMenu();
  }, [setChatReplyingTo, message, closeMenu]);

  const handleEdit = useCallback(() => {
    setChatEditing({ chatId: message.chatId, messageId: message.id });
    closeMenu();
  }, [setChatEditing, message, closeMenu]);

  const handlePin = useCallback(() => {
    pinMessage({ messageId: message.id });
    closeMenu();
  }, [pinMessage, message.id, closeMenu]);

  const handleForward = useCallback(() => {
    closeMenu();
    openForwardMenu({ fromChatId: message.chatId, messageIds: [message.id] });
  }, [openForwardMenu, message, closeMenu]);

  const handleFaveSticker = useCallback(() => {
    closeMenu();
    faveSticker({ sticker: message.content.sticker });
  }, [closeMenu, message.content.sticker, faveSticker]);

  const handleUnfaveSticker = useCallback(() => {
    closeMenu();
    unfaveSticker({ sticker: message.content.sticker });
  }, [closeMenu, message.content.sticker, unfaveSticker]);

  useEffect(() => {
    disableScrolling();

    return enableScrolling;
  }, []);

  useEffect(() => {
    document.body.classList.toggle('has-open-context-menu', isOpen);
    if (isOpen) {
      // This replaces `transform` based MessageList position with relative positioning to prevent
      // issues with Context Menu backdrop.
      // `transiton-locked` class prevents content from jumping when properties change
      document.body.classList.add('message-list-no-transform', 'transition-locked');
    }
  }, [isOpen]);

  return (
    <div className={['ContextMenuContainer', transitionClassNames].join(' ')}>
      <MessageContextMenu
        message={message}
        isOpen={isMenuOpen}
        anchor={anchor}
        canReply={canReply}
        canDelete={canDelete}
        canPin={canPin}
        canEdit={canEdit}
        canForward={canForward}
        canFaveSticker={canFaveSticker}
        canUnfaveSticker={canUnfaveSticker}
        onReply={handleReply}
        onEdit={handleEdit}
        onPin={handlePin}
        onForward={handleForward}
        onDelete={handleDelete}
        onFaveSticker={handleFaveSticker}
        onUnfaveSticker={handleUnfaveSticker}
        onClose={closeMenu}
      />
      <DeleteMessageModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        message={message}
      />
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { message }): StateProps => {
    const {
      canReply,
      canPin,
      canDelete,
      canEdit,
      canForward,
      canFaveSticker,
      canUnfaveSticker,
    } = selectAllowedMessagedActions(global, message);

    return {
      canReply,
      canPin,
      canDelete,
      canEdit,
      canForward,
      canFaveSticker,
      canUnfaveSticker,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'setChatReplyingTo',
    'setChatEditing',
    'pinMessage',
    'openForwardMenu',
    'faveSticker',
    'unfaveSticker',
  ]),
)(ContextMenuContainer));
