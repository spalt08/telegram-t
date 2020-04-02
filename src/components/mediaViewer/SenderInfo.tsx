import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';
import { GlobalActions } from '../../global/types';
import { ApiChat, ApiMessage, ApiUser } from '../../api/types';

import { getUserFullName, isChatChannel, isChatPrivate } from '../../modules/helpers';
import { formatMediaDateTime } from '../../util/dateFormat';
import {
  selectChat,
  selectChatMessage,
  selectSender,
  selectUser,
} from '../../modules/selectors';

import Avatar from '../common/Avatar';

import './SenderInfo.scss';

type OwnProps = {
  messageId?: number;
  chatId?: number;
  isAvatar?: boolean;
};

type StateProps = {
  sender?: ApiUser | ApiChat;
  message?: ApiMessage;
  isChannelChatMessage?: boolean;
};

type DispatchProps = Pick<GlobalActions, 'openMediaViewer' | 'openUserInfo' | 'openChatWithInfo'>;

const SenderInfo: FC<OwnProps & StateProps & DispatchProps> = ({
  sender, isChannelChatMessage, isAvatar, message, openMediaViewer, openUserInfo, openChatWithInfo,
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

  if (!sender || (!message && !isAvatar)) {
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
        <div className="date">
          {isAvatar ? 'Profile photo' : formatMediaDateTime(message!.date * 1000)}
        </div>
      </div>
    </div>
  );
};

export default withGlobal((global, { chatId, messageId, isAvatar }) => {
  if (isAvatar) {
    const sender = isChatPrivate(chatId) ? selectUser(global, chatId) : selectChat(global, chatId);

    return {
      sender,
      isChannelChatMessage: !isChatPrivate(chatId),
    };
  }

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
