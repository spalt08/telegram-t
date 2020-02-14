import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';
import { GlobalActions } from '../../global/types';
import { ApiChat, ApiMessage, ApiUser } from '../../api/types';

import { getUserFullName, isChatChannel } from '../../modules/helpers';
import { formatMediaDateTime } from '../../util/dateFormat';
import { selectChat, selectChatMessage, selectSender } from '../../modules/selectors';

import Avatar from '../common/Avatar';

import './SenderInfo.scss';

type IProps = Pick<GlobalActions, 'openMediaViewer' | 'openUserInfo' | 'openChatWithInfo'> & {
  messageId?: number;
  chatId?: number;
  message?: ApiMessage;
  isChannelChatMessage?: boolean;
  sender?: ApiUser | ApiChat;
};

const SenderInfo: FC<IProps> = ({
  sender, isChannelChatMessage, message, openMediaViewer, openUserInfo, openChatWithInfo,
}) => {
  const openSenderInfo = useCallback(() => {
    if (sender) {
      openMediaViewer({ chatId: undefined, messageId: undefined });
      if (isChannelChatMessage) {
        openChatWithInfo({ id: sender.id });
      } else {
        openUserInfo({ id: sender.id });
      }
    }
  }, [sender, openMediaViewer, isChannelChatMessage, openChatWithInfo, openUserInfo]);

  if (!message || !sender) {
    return null;
  }

  return (
    <div className="SenderInfo" onClick={openSenderInfo}>
      {isChannelChatMessage ? (
        <Avatar key={sender.id} size="medium" chat={sender as ApiChat} />
      ) : (
        <Avatar key={sender.id} size="medium" user={sender as ApiUser} />
      )}
      <div className="meta">
        <div className="title">
          {isChannelChatMessage ? (sender as ApiChat).title : getUserFullName(sender as ApiUser)}
        </div>
        <div className="date">{formatMediaDateTime(message.date * 1000)}</div>
      </div>
    </div>
  );
};

export default withGlobal((global, { chatId, messageId }) => {
  if (!messageId || !chatId) {
    return {};
  }

  let sender;
  let isChannelChatMessage = false;
  const chat = selectChat(global, chatId);
  const message = selectChatMessage(global, chatId, messageId);

  if (!message) {
    return {};
  }

  if (chat && isChatChannel(chat)) {
    sender = chat;
    isChannelChatMessage = true;
  } else {
    sender = selectSender(global, message as ApiMessage);
  }

  return {
    isChannelChatMessage,
    sender,
    message,
  };
},
(setGlobal, actions) => {
  const { openMediaViewer, openUserInfo, openChatWithInfo } = actions;
  return { openMediaViewer, openUserInfo, openChatWithInfo };
})(SenderInfo);
