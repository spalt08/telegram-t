import React, {
  FC, memo, useCallback, useEffect, useState,
} from '../../lib/teact/teact';
import { GlobalActions } from '../../global/types';
import { withGlobal } from '../../lib/teact/teactn';
import { ApiChat } from '../../api/types';

import { disableScrolling, enableScrolling } from '../../util/scrollLock';
import useShowTransition from '../../hooks/useShowTransition';
import { selectChat, selectIsChatWithSelf } from '../../modules/selectors';
import { pick } from '../../util/iteratees';
import {
  isChatBasicGroup, isChatChannel, isChatPrivate, isChatSuperGroup,
} from '../../modules/helpers';

import Portal from '../ui/Portal';
import Menu from '../ui/Menu';
import MenuItem from '../ui/MenuItem';
import DeleteChatModal from '../common/DeleteChatModal';

import './HeaderMenuContainer.scss';

type DispatchProps = Pick<GlobalActions, 'updateChatMutedState'>;

type IAnchorPosition = {
  x: number;
  y: number;
};

export type OwnProps = {
  chatId: number;
  isOpen: boolean;
  anchor: IAnchorPosition;
  onClose: () => void;
  onCloseAnimationEnd: () => void;
};

type StateProps = {
  chat?: ApiChat;
  isChatWithSelf?: boolean;
  isPrivate?: boolean;
  isMuted?: boolean;
  canDeleteChat?: boolean;
};

const HeaderMenuContainer: FC<OwnProps & StateProps & DispatchProps> = ({
  chatId,
  chat,
  isOpen,
  isChatWithSelf,
  isPrivate,
  isMuted,
  canDeleteChat,
  anchor,
  onClose,
  onCloseAnimationEnd,
  updateChatMutedState,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { x, y } = anchor;
  useShowTransition(isOpen, onCloseAnimationEnd, undefined, false);

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

  const handleToggleMuteClick = useCallback(() => {
    updateChatMutedState({ chatId, isMuted: !isMuted });
    closeMenu();
  }, [chatId, closeMenu, isMuted, updateChatMutedState]);

  useEffect(() => {
    disableScrolling();

    return enableScrolling;
  }, []);

  return (
    <Portal>
      <div className="HeaderMenuContainer">
        <Menu
          isOpen={isMenuOpen}
          positionX="right"
          style={`left: ${x}px;top: ${y}px;`}
          onClose={closeMenu}
        >
          {!isChatWithSelf && (
            <MenuItem
              icon={isMuted ? 'unmute' : 'mute'}
              onClick={handleToggleMuteClick}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </MenuItem>
          )}
          <MenuItem
            className="danger"
            icon="delete"
            onClick={handleDelete}
          >
            {isPrivate ? 'Delete' : (canDeleteChat ? 'Delete and Leave' : 'Leave')}
          </MenuItem>
        </Menu>
        {chat && (
          <DeleteChatModal
            isOpen={isDeleteModalOpen}
            onClose={closeDeleteModal}
            chat={chat}
          />
        )}
      </div>
    </Portal>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { chatId }): StateProps => {
    const chat = selectChat(global, chatId);
    if (!chat || chat.isRestricted) {
      return {};
    }

    return {
      chat,
      isMuted: chat.isMuted,
      isChatWithSelf: selectIsChatWithSelf(global, chat),
      isPrivate: isChatPrivate(chat.id),
      canDeleteChat: isChatBasicGroup(chat) || ((isChatSuperGroup(chat) || isChatChannel(chat)) && chat.isCreator),
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'updateChatMutedState',
  ]),
)(HeaderMenuContainer));
