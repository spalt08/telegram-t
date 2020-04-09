import React, {
  FC, memo, useCallback, useEffect, useState,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiMessage } from '../../../api/types';

import { selectAllowedMessagedActions } from '../../../modules/selectors';
import { disableScrolling, enableScrolling } from '../../../util/scrollLock';
import useShowTransition from '../../../hooks/useShowTransition';

import DeleteMessageModal from '../../common/DeleteMessageModal';
import MessageContextMenu from './MessageContextMenu';

import './ContextMenuContainer.scss';

type IAnchorPosition = {
  x: number;
  y: number;
};

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
};

type DispatchProps = Pick<GlobalActions, 'setChatReplyingTo' | 'setChatEditing' | 'pinMessage' | 'openForwardMenu'>;

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
  setChatReplyingTo,
  setChatEditing,
  pinMessage,
  openForwardMenu,
}) => {
  const { transitionClassNames } = useShowTransition(isOpen, onCloseAnimationEnd, undefined, false);
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
    setChatReplyingTo({ chatId: message.chat_id, messageId: message.id });
    closeMenu();
  }, [setChatReplyingTo, message, closeMenu]);

  const handleEdit = useCallback(() => {
    setChatEditing({ chatId: message.chat_id, messageId: message.id });
    closeMenu();
  }, [setChatEditing, message, closeMenu]);

  const handlePin = useCallback(() => {
    pinMessage({ messageId: message.id });
    closeMenu();
  }, [pinMessage, message, closeMenu]);

  const handleForward = useCallback(() => {
    openForwardMenu({ fromChatId: message.chat_id, messageIds: [message.id] });
    closeMenu();
  }, [openForwardMenu, message, closeMenu]);

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
        canDelete={canDelete}
        canPin={canPin}
        canEdit={canEdit}
        onReply={handleReply}
        onEdit={handleEdit}
        onPin={handlePin}
        onForward={handleForward}
        onDelete={handleDelete}
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
      canReply, canPin, canDelete, canEdit,
    } = selectAllowedMessagedActions(global, message);

    return {
      canReply,
      canPin,
      canDelete,
      canEdit,
    };
  },
  (setGlobal, actions): DispatchProps => {
    const {
      setChatReplyingTo,
      setChatEditing,
      pinMessage,
      openForwardMenu,
    } = actions;
    return {
      setChatReplyingTo,
      setChatEditing,
      pinMessage,
      openForwardMenu,
    };
  },
)(ContextMenuContainer));
