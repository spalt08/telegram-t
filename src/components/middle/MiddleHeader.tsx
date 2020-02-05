import React, { FC } from '../../lib/teact/teact';
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

type IProps = {
  chatId: number;
  pinnedMessageId?: number;
  pinnedMessage?: ApiMessage;
  canUnpin?: boolean;
} & Pick<GlobalActions, 'openChatWithInfo' | 'pinMessage'>;

const MiddleHeader: FC<IProps> = ({
  chatId,
  pinnedMessageId,
  pinnedMessage,
  canUnpin,
  openChatWithInfo,
  pinMessage,
}) => {
  useEnsureMessage(chatId, pinnedMessageId, pinnedMessage);

  function onHeaderClick() {
    openChatWithInfo({ id: chatId });
  }

  function onUnpinMessage() {
    pinMessage({ chatId, messageId: 0 });
  }

  return (
    <div className="MiddleHeader">
      <div onClick={onHeaderClick}>
        {isChatPrivate(chatId) ? (
          <PrivateChatInfo userId={chatId} />
        ) : (
          <GroupChatInfo chatId={chatId} />
        )}
      </div>

      {pinnedMessage && (
        <HeaderPinnedMessage
          message={pinnedMessage}
          onUnpinMessage={canUnpin ? onUnpinMessage : undefined}
        />
      )}
      <HeaderActions />
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
    const { openChatWithInfo, pinMessage } = actions;
    return { openChatWithInfo, pinMessage };
  },
)(MiddleHeader);
