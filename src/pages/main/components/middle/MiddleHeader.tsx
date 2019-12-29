import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { GlobalActions } from '../../../../store/types';
import { ApiMessage, ApiChat, ApiUser } from '../../../../api/types';
import { getPrivateChatUserId, isPrivateChat } from '../../../../modules/helpers';
import { selectChat, selectChatMessage, selectUser } from '../../../../modules/selectors';
import PrivateChatInfo from '../common/PrivateChatInfo';
import GroupChatInfo from '../common/GroupChatInfo';
import HeaderActions from './HeaderActions';
import HeaderPinnedMessage from './HeaderPinnedMessage';

import './MiddleHeader.scss';

type IProps = {
  chatId: number;
  pinnedMessage?: ApiMessage;
} & Pick<GlobalActions, 'openChatWithInfo'>;

const MiddleHeader: FC<IProps> = ({
  chatId, pinnedMessage, openChatWithInfo,
}) => {
  function onHeaderClick() {
    openChatWithInfo({ id: chatId });
  }

  return (
    <div className="MiddleHeader" onClick={onHeaderClick}>
      {isPrivateChat(chatId) ? (
        <PrivateChatInfo userId={chatId} />
      ) : (
        <GroupChatInfo chatId={chatId} />
      )}
      {pinnedMessage && (
        <HeaderPinnedMessage message={pinnedMessage} />
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
    if (isPrivateChat(chatId)) {
      const id = chat && getPrivateChatUserId(chat);
      target = id ? selectUser(global, id) : undefined;
    }

    if (target && target.full_info) {
      const { pinned_message_id } = target.full_info;
      const pinnedMessage = pinned_message_id && selectChatMessage(global, chatId, pinned_message_id);
      if (pinnedMessage) {
        return { pinnedMessage };
      }
    }

    return null;
  },
  (setGlobal, actions) => {
    const { openChatWithInfo } = actions;
    return { openChatWithInfo };
  },
)(MiddleHeader);
