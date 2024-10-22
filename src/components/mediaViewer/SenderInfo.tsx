import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiChat, ApiMessage, ApiUser } from '../../api/types';

import { getUserFullName, isChatChannel, isChatPrivate } from '../../modules/helpers';
import { formatMediaDateTime } from '../../util/dateFormat';
import renderText from '../common/helpers/renderText';
import {
  selectChat,
  selectChatMessage,
  selectSender,
  selectUser,
} from '../../modules/selectors';
import { pick } from '../../util/iteratees';

import Avatar from '../common/Avatar';

import './SenderInfo.scss';

type OwnProps = {
  chatId?: number;
  messageId?: number;
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
    return undefined;
  }

  const senderTitle = isChannelChatMessage ? (sender as ApiChat).title : getUserFullName(sender as ApiUser);

  return (
    <div className="SenderInfo" onClick={openSenderInfo}>
      {isChannelChatMessage ? (
        <Avatar key={sender.id} size="medium" chat={sender as ApiChat} />
      ) : (
        <Avatar key={sender.id} size="medium" user={sender as ApiUser} />
      )}
      <div className="meta">
        <div className="title">
          {senderTitle && renderText(senderTitle)}
        </div>
        <div className="date">
          {isAvatar ? 'Profile photo' : formatMediaDateTime(message!.date * 1000)}
        </div>
      </div>
    </div>
  );
};

export default withGlobal<OwnProps>(
  (global, { chatId, messageId, isAvatar }): StateProps => {
    if (isAvatar && chatId) {
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
  (setGlobal, actions): DispatchProps => pick(actions, ['openMediaViewer', 'openUserInfo', 'openChatWithInfo']),
)(SenderInfo);
