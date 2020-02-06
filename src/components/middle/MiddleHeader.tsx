import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../store/types';
import { ApiMessage, ApiChat, ApiUser } from '../../api/types';
import { getPrivateChatUserId, isChatPrivate } from '../../modules/helpers';
import {
  selectChat, selectChatMessage, selectUser, selectAllowedMessagedActions,
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
} & Pick<GlobalActions, 'openChatWithInfo' | 'openMessageSearch' | 'pinMessage'>;

const MiddleHeader: FC<IProps> = ({
  chatId,
  pinnedMessageId,
  pinnedMessage,
  canUnpin,
  openChatWithInfo,
  openMessageSearch,
  pinMessage,
}) => {
  useEnsureMessage(chatId, pinnedMessageId, pinnedMessage);

  const handleHeaderClick = useCallback(() => {
    openChatWithInfo({ id: chatId });
  }, [openChatWithInfo, chatId]);

  const handleSearchClick = useCallback(() => {
    openMessageSearch({ id: chatId });
    setTimeout(() => {
      const searchInput = document.querySelector('.RightHeader .SearchInput input') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, SEARCH_FOCUS_DELAY_MS);
  }, [openMessageSearch, chatId]);

  const handleUnpinMessage = useCallback(() => {
    pinMessage({ chatId, messageId: 0 });
  }, [pinMessage, chatId]);

  return (
    <div className="MiddleHeader">
      <div onClick={handleHeaderClick}>
        {isChatPrivate(chatId) ? (
          <PrivateChatInfo userId={chatId} />
        ) : (
          <GroupChatInfo chatId={chatId} />
        )}
      </div>

      {pinnedMessage && (
        <HeaderPinnedMessage
          message={pinnedMessage}
          onUnpinMessage={canUnpin ? handleUnpinMessage : undefined}
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
      const { pinned_message_id } = target.full_info;
      const pinnedMessage = pinned_message_id && selectChatMessage(global, chatId, pinned_message_id);

      if (pinnedMessage) {
        const { canPin } = selectAllowedMessagedActions(global, pinnedMessage);

        return {
          pinnedMessageId: pinned_message_id,
          pinnedMessage,
          canUnpin: canPin,
        };
      } else {
        return {
          pinnedMessageId: pinned_message_id,
        };
      }
    }

    return null;
  },
  (setGlobal, actions) => {
    const { openChatWithInfo, openMessageSearch, pinMessage } = actions;
    return { openChatWithInfo, openMessageSearch, pinMessage };
  },
)(MiddleHeader);
