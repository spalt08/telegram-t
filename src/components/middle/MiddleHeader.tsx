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
  selectChat,
  selectChatMessage,
  selectUser,
  selectAllowedMessagedActions,
} from '../../modules/selectors';
import useEnsureMessage from '../../hooks/useEnsureMessage';
import { pick } from '../../util/iteratees';

import PrivateChatInfo from '../common/PrivateChatInfo';
import GroupChatInfo from '../common/GroupChatInfo';
import HeaderActions from './HeaderActions';
import HeaderPinnedMessage from './HeaderPinnedMessage';

import './MiddleHeader.scss';

// Chrome breaks layout when focusing input during transition
const SEARCH_FOCUS_DELAY_MS = 200;

type OwnProps = {
  chatId: number;
};

type StateProps = {
  pinnedMessageId?: number;
  pinnedMessage?: ApiMessage;
  canUnpin?: boolean;
  typingStatus?: ApiTypingStatus;
};

type DispatchProps = Pick<GlobalActions, 'openChatWithInfo' | 'openMessageTextSearch' | 'pinMessage' | 'focusMessage'>;

const MiddleHeader: FC<OwnProps & StateProps & DispatchProps> = ({
  chatId,
  pinnedMessageId,
  pinnedMessage,
  canUnpin,
  typingStatus,
  openChatWithInfo,
  openMessageTextSearch,
  pinMessage,
  focusMessage,
}) => {
  useEnsureMessage(chatId, pinnedMessageId, pinnedMessage);

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

  return (
    <div className="MiddleHeader">
      <div onClick={handleHeaderClick}>
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
        onSearchClick={handleSearchClick}
      />
    </div>
  );
};

export default withGlobal<OwnProps>(
  (global, { chatId }): StateProps => {
    const chat = selectChat(global, chatId);
    let target: ApiChat | ApiUser | undefined = chat;
    if (isChatPrivate(chatId)) {
      const id = chat && getPrivateChatUserId(chat);
      target = id ? selectUser(global, id) : undefined;
    }

    if (chat && target && target.fullInfo) {
      const { typingStatus } = chat;
      const { pinnedMessageId } = target.fullInfo;
      const pinnedMessage = pinnedMessageId ? selectChatMessage(global, chatId, pinnedMessageId) : undefined;

      if (pinnedMessage) {
        const { canPin } = selectAllowedMessagedActions(global, pinnedMessage);

        return {
          pinnedMessageId,
          pinnedMessage,
          canUnpin: canPin,
          typingStatus,
        };
      } else {
        return {
          pinnedMessageId,
          typingStatus,
        };
      }
    }

    return {};
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'openChatWithInfo',
    'openMessageTextSearch',
    'pinMessage',
    'focusMessage',
  ]),
)(MiddleHeader);
