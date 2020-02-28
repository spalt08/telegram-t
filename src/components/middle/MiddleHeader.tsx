import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import {
  ApiMessage,
  ApiChat,
  ApiUser,
  ApiTypingStatus,
} from '../../api/types';
import { getPrivateChatUserId, isChatPrivate } from '../../modules/helpers';
import {
  selectChat, selectChatMessage, selectUser, selectAllowedMessagedActions, selectChatMessageViewportIds,
} from '../../modules/selectors';
import useEnsureMessage from '../../hooks/useEnsureMessage';
import PrivateChatInfo from '../common/PrivateChatInfo';
import GroupChatInfo from '../common/GroupChatInfo';
import HeaderActions from './HeaderActions';
import HeaderPinnedMessage from './HeaderPinnedMessage';

import './MiddleHeader.scss';

const SEARCH_FOCUS_DELAY_MS = 50;

type IProps = {
  chatId: number;
  pinnedMessageId?: number;
  pinnedMessage?: ApiMessage;
  canUnpin?: boolean;
  isPinnedMessageInViewport?: boolean;
  typingStatus?: ApiTypingStatus;
} & Pick<GlobalActions, 'openChatWithInfo' | 'openMessageSearch' | 'pinMessage' | 'focusMessage'>;

const MiddleHeader: FC<IProps> = ({
  chatId,
  pinnedMessageId,
  pinnedMessage,
  canUnpin,
  isPinnedMessageInViewport,
  typingStatus,
  openChatWithInfo,
  openMessageSearch,
  pinMessage,
  focusMessage,
}) => {
  useEnsureMessage(chatId, pinnedMessageId, pinnedMessage);

  const handleHeaderClick = useCallback(() => {
    openChatWithInfo({ id: chatId });
  }, [openChatWithInfo, chatId]);

  const handleSearchClick = useCallback(() => {
    openMessageSearch();
    setTimeout(() => {
      const searchInput = document.querySelector('.RightHeader .SearchInput input') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, SEARCH_FOCUS_DELAY_MS);
  }, [openMessageSearch]);

  const handleUnpinMessage = useCallback(() => {
    pinMessage({ chatId, messageId: 0 });
  }, [pinMessage, chatId]);

  const handlePinnedMessageClick = useCallback((): void => {
    if (pinnedMessage) {
      focusMessage({ chatId: pinnedMessage.chat_id, messageId: pinnedMessage.id });
    }
  }, [focusMessage, pinnedMessage]);

  return (
    <div className="MiddleHeader">
      <div onClick={handleHeaderClick}>
        {isChatPrivate(chatId) ? (
          <PrivateChatInfo userId={chatId} typingStatus={typingStatus} />
        ) : (
          <GroupChatInfo chatId={chatId} typingStatus={typingStatus} />
        )}
      </div>

      {pinnedMessage && (
        <HeaderPinnedMessage
          message={pinnedMessage}
          onUnpinMessage={canUnpin ? handleUnpinMessage : undefined}
          onClick={handlePinnedMessageClick}
          isInViewPort={isPinnedMessageInViewport}
        />
      )}
      <HeaderActions
        onSearchClick={handleSearchClick}
      />
    </div>
  );
};

export default withGlobal(
  (global, { chatId }: IProps) => {
    const chat = selectChat(global, chatId);
    if (!chat) {
      return null;
    }

    let target: ApiChat | ApiUser | undefined = chat;
    if (isChatPrivate(chatId)) {
      const id = chat && getPrivateChatUserId(chat);
      target = id ? selectUser(global, id) : undefined;
    }

    if (target && target.full_info) {
      const { typingStatus } = chat;
      const { pinned_message_id } = target.full_info;
      const pinnedMessage = pinned_message_id && selectChatMessage(global, chatId, pinned_message_id);

      if (pinnedMessage) {
        const { canPin } = selectAllowedMessagedActions(global, pinnedMessage);
        const viewportIds = selectChatMessageViewportIds(global, pinnedMessage.chat_id);
        const isPinnedMessageInViewport = viewportIds && viewportIds.includes(pinnedMessage.id);

        return {
          pinnedMessageId: pinned_message_id,
          pinnedMessage,
          canUnpin: canPin,
          isPinnedMessageInViewport,
          typingStatus,
        };
      } else {
        return {
          pinnedMessageId: pinned_message_id,
          typingStatus,
        };
      }
    }

    return null;
  },
  (setGlobal, actions) => {
    const {
      openChatWithInfo,
      openMessageSearch,
      pinMessage,
      focusMessage,
    } = actions;
    return {
      openChatWithInfo,
      openMessageSearch,
      pinMessage,
      focusMessage,
    };
  },
)(MiddleHeader);
