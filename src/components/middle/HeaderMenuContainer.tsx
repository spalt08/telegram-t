import React, {
  FC, memo, useCallback, useEffect, useState,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiChat } from '../../api/types';
import { IAnchorPosition } from '../../types';

import { disableScrolling, enableScrolling } from '../../util/scrollLock';
import useShowTransition from '../../hooks/useShowTransition';
import { selectChat, selectIsChatWithSelf } from '../../modules/selectors';
import { pick } from '../../util/iteratees';
import { isChatPrivate, getCanDeleteChat } from '../../modules/helpers';
import { IS_MOBILE_SCREEN } from '../../util/environment';

import Portal from '../ui/Portal';
import Menu from '../ui/Menu';
import MenuItem from '../ui/MenuItem';
import DeleteChatModal from '../common/DeleteChatModal';

import './HeaderMenuContainer.scss';

type DispatchProps = Pick<GlobalActions, 'updateChatMutedState'>;

export type OwnProps = {
  chatId: number;
  isOpen: boolean;
  anchor: IAnchorPosition;
  canSubscribe?: boolean;
  isChannel?: boolean;
  onSubscribeChannel: () => void;
  onSearchClick: () => void;
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
  canSubscribe,
  isChannel,
  onSubscribeChannel,
  onSearchClick,
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

  const handleSubscribe = useCallback(() => {
    onSubscribeChannel();
    closeMenu();
  }, [closeMenu, onSubscribeChannel]);

  const handleSearch = useCallback(() => {
    document.getElementById('magic-input')!.focus();
    onSearchClick();
    closeMenu();
  }, [closeMenu, onSearchClick]);

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
          {IS_MOBILE_SCREEN && canSubscribe && (
            <MenuItem
              icon={isChannel ? 'channel' : 'group'}
              onClick={handleSubscribe}
            >
              {isChannel ? 'Subscribe' : 'Join Group'}
            </MenuItem>
          )}
          {IS_MOBILE_SCREEN && (
            <MenuItem
              icon="search"
              onClick={handleSearch}
            >
              Search
            </MenuItem>
          )}
          {!canSubscribe && !isChatWithSelf && (
            <MenuItem
              icon={isMuted ? 'unmute' : 'mute'}
              onClick={handleToggleMuteClick}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </MenuItem>
          )}
          {!canSubscribe && (
            <MenuItem
              destructive
              icon="delete"
              onClick={handleDelete}
            >
              {isPrivate ? 'Delete' : (canDeleteChat ? 'Delete and Leave' : 'Leave')}
            </MenuItem>
          )}
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
      canDeleteChat: getCanDeleteChat(chat),
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'updateChatMutedState',
  ]),
)(HeaderMenuContainer));
