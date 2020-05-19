import React, { FC, useCallback, useMemo } from '../../lib/teact/teact';
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
  selectChat,
  selectChatMessage,
  selectUser,
  selectAllowedMessagedActions,
  selectIsRightColumnShown,
} from '../../modules/selectors';
import useEnsureMessage from '../../hooks/useEnsureMessage';
import useUpdateOnResize from '../../hooks/useUpdateOnResize';
import { pick } from '../../util/iteratees';
import { formatIntegerCompact } from '../../util/textFormat';
import {
  MIN_SCREEN_WIDTH_FOR_STATIC_LEFT_COLUMN,
  MOBILE_SCREEN_MAX_WIDTH,
  EDITABLE_INPUT_ID,
} from '../../config';

import PrivateChatInfo from '../common/PrivateChatInfo';
import GroupChatInfo from '../common/GroupChatInfo';
import Button from '../ui/Button';
import HeaderActions from './HeaderActions';
import HeaderPinnedMessage from './HeaderPinnedMessage';

import './MiddleHeader.scss';

// Chrome breaks layout when focusing input during transition
const SEARCH_FOCUS_DELAY_MS = 400;

type OwnProps = {
  chatId: number;
};

type StateProps = {
  pinnedMessageId?: number;
  pinnedMessage?: ApiMessage;
  canUnpin?: boolean;
  typingStatus?: ApiTypingStatus;
  isLeftColumnShown?: boolean;
  isRightColumnShown?: boolean;
  chatsById?: Record<number, ApiChat>;
};

type DispatchProps = Pick<GlobalActions, (
  'openChatWithInfo' | 'openMessageTextSearch' |
  'pinMessage' | 'focusMessage' | 'openChat'
)>;

const MiddleHeader: FC<OwnProps & StateProps & DispatchProps> = ({
  chatId,
  pinnedMessageId,
  pinnedMessage,
  canUnpin,
  typingStatus,
  isLeftColumnShown,
  isRightColumnShown,
  chatsById,
  openChatWithInfo,
  openMessageTextSearch,
  pinMessage,
  focusMessage,
  openChat,
}) => {
  useEnsureMessage(chatId, pinnedMessageId, pinnedMessage);

  useUpdateOnResize();

  const shouldShowRevealButton = window.innerWidth <= MIN_SCREEN_WIDTH_FOR_STATIC_LEFT_COLUMN;

  const handleHeaderClick = useCallback(() => {
    openChatWithInfo({ id: chatId });
  }, [openChatWithInfo, chatId]);

  const handleSearchClick = useCallback(() => {
    openMessageTextSearch();
    setTimeout(() => {
      const searchInput = document.querySelector('.RightHeader .SearchInput input') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, SEARCH_FOCUS_DELAY_MS);
  }, [openMessageTextSearch]);

  const handleUnpinMessage = useCallback(() => {
    pinMessage({ chatId, messageId: 0 });
  }, [pinMessage, chatId]);

  const handlePinnedMessageClick = useCallback((): void => {
    if (pinnedMessage) {
      focusMessage({ chatId: pinnedMessage.chatId, messageId: pinnedMessage.id });
    }
  }, [focusMessage, pinnedMessage]);

  const handleChatListRevealClick = useCallback(() => {
    if (isLeftColumnShown) {
      openChat({ id: chatId });
    } else {
      const messageInput = document.getElementById(EDITABLE_INPUT_ID);
      if (messageInput) {
        messageInput.blur();
      }
      openChat({ id: undefined });
    }
  }, [openChat, chatId, isLeftColumnShown]);

  const unreadCount = useMemo(() => {
    if (!shouldShowRevealButton || !chatsById) {
      return undefined;
    }

    let isActive = false;

    const totalCount = Object.values(chatsById).reduce((total, chat) => {
      const count = chat.unreadCount || 0;
      if (count && (!chat.isMuted || chat.unreadMentionsCount)) {
        isActive = true;
      }

      return total + count;
    }, 0);

    if (!totalCount) {
      return undefined;
    }

    return {
      isActive,
      totalCount,
    };
  }, [shouldShowRevealButton, chatsById]);

  const isChatListButtonInBackState = window.innerWidth < MOBILE_SCREEN_MAX_WIDTH || !isLeftColumnShown;

  return (
    <div className="MiddleHeader">
      {shouldShowRevealButton && (
        <div className="chat-list-reveal-button">
          <Button
            round
            size="smaller"
            color="translucent"
            onClick={handleChatListRevealClick}
          >
            <div className={`animated-close-icon ${isChatListButtonInBackState ? 'state-back' : ''}`} />
          </Button>
          {unreadCount && (
            <div className={`unread-count ${unreadCount.isActive ? 'active' : ''}`}>
              {formatIntegerCompact(unreadCount.totalCount)}
            </div>
          )}
        </div>
      )}
      <div className="chat-info-wrapper" onClick={handleHeaderClick}>
        {isChatPrivate(chatId) ? (
          <PrivateChatInfo userId={chatId} typingStatus={typingStatus} showFullInfo />
        ) : (
          <GroupChatInfo chatId={chatId} typingStatus={typingStatus} showFullInfo />
        )}
      </div>

      {pinnedMessage && (
        <HeaderPinnedMessage
          message={pinnedMessage}
          onUnpinMessage={canUnpin ? handleUnpinMessage : undefined}
          onClick={handlePinnedMessageClick}
        />
      )}
      <HeaderActions
        isRightColumnShown={isRightColumnShown}
        onSearchClick={handleSearchClick}
      />
    </div>
  );
};

export default withGlobal<OwnProps>(
  (global, { chatId }): StateProps => {
    const { isLeftColumnShown } = global;
    const { byId: chatsById } = global.chats;
    const chat = selectChat(global, chatId);
    let target: ApiChat | ApiUser | undefined = chat;
    if (isChatPrivate(chatId)) {
      const id = chat && getPrivateChatUserId(chat);
      target = id ? selectUser(global, id) : undefined;
    }

    const { typingStatus } = chat || {};

    const state = {
      typingStatus,
      isLeftColumnShown,
      isRightColumnShown: selectIsRightColumnShown(global),
      chatsById,
    };

    if (chat && target && target.fullInfo) {
      const { pinnedMessageId } = target.fullInfo;
      const pinnedMessage = pinnedMessageId ? selectChatMessage(global, chatId, pinnedMessageId) : undefined;

      if (pinnedMessage) {
        const { canPin } = selectAllowedMessagedActions(global, pinnedMessage);

        return {
          ...state,
          pinnedMessageId,
          pinnedMessage,
          canUnpin: canPin,
        };
      } else {
        return {
          ...state,
          pinnedMessageId,
        };
      }
    }

    return state;
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'openChatWithInfo',
    'openMessageTextSearch',
    'pinMessage',
    'focusMessage',
    'openChat',
  ]),
)(MiddleHeader);
