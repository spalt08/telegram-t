import React, { FC, memo } from '../../../../lib/teact';
import { ApiChat, ApiMessage, ApiUser } from '../../../../api/types';
import Avatar from '../../../../components/Avatar';
import { getUserFullName, isChannelChat } from '../../../../modules/helpers';
import { formatMediaDateTime } from '../../../../util/dateFormat';
import { withGlobal } from '../../../../lib/teactn';
import { selectChat, selectChatMessage, selectSender } from '../../../../modules/selectors';

import './SenderInfo.scss';

type IProps = {
  chatId: number;
  messageId: number;
  message: ApiMessage;
  isChannelChatMessage: boolean;
  sender: ApiUser | ApiChat;
};

const SenderInfo: FC<IProps> = ({
  messageId, sender, isChannelChatMessage, message,
}) => {
  if (!messageId) {
    return null;
  }

  return (
    <div className="SenderInfo">
      {isChannelChatMessage ? (
        <Avatar size="medium" chat={sender as ApiChat} />
      ) : (
        <Avatar size="medium" user={sender as ApiUser} />
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

export default memo(withGlobal((global, { chatId, messageId }) => {
  if (!messageId || !chatId) {
    return {};
  }

  let sender;
  const isChannelChatMessage = isChannelChat(chatId);
  const message = selectChatMessage(global, chatId, messageId);

  if (!message) {
    return {};
  }

  if (isChannelChatMessage) {
    sender = selectChat(global, chatId);
  } else {
    sender = selectSender(global, message as ApiMessage);
  }

  return {
    isChannelChatMessage,
    sender,
    message,
  };
})(SenderInfo));
