import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import {
  ApiUser,
  ApiMessage,
  ApiPhoto,
  ApiSticker,
} from '../../../../api/tdlib/types';
import {
  isOwnMessage,
  getUserFullName,
  getPhotoUrl,
} from '../../../../modules/tdlib/helpers';
import { selectUser, selectChatMessage } from '../../../../modules/tdlib/selectors';

import Avatar from '../../../../components/Avatar';
import Spinner from '../../../../components/Spinner';

import { buildMessageContent } from './util/messages';
import MessageMeta from './MessageMeta';
import ReplyMessage from './ReplyMessage';
import './Message.scss';

type IProps = {
  message: ApiMessage;
  replyMessage?: ApiMessage;
  showAvatar?: boolean;
  showSenderName?: boolean;
  sender?: ApiUser;
};

const Message: FC<IProps> = ({
  message, replyMessage, showAvatar, showSenderName, sender,
}) => {
  const className = buildClassName(message);
  const {
    text,
    photo,
    sticker,
    className: contentClassName,
  } = buildMessageContent(message);
  const isText = contentClassName && contentClassName.includes('text');

  return (
    <div className={className}>
      {showAvatar && sender && (
        <Avatar size="small" user={sender} />
      )}
      <div className={contentClassName}>
        {showSenderName && sender && isText && !photo && (
          <div className="sender-name">{getUserFullName(sender)}</div>
        )}
        {replyMessage && <ReplyMessage message={replyMessage} />}
        {renderMessagePhoto(photo)}
        {renderMessageSticker(sticker)}
        {text && (
          <p>{text}</p>
        )}
        <MessageMeta message={message} />
      </div>
    </div>
  );
};

function buildClassName(message: ApiMessage) {
  const classNames = ['Message'];

  if (isOwnMessage(message)) {
    classNames.push('own');
  }

  return classNames.join(' ');
}

function renderMessagePhoto(photo?: ApiPhoto) {
  if (!photo) {
    return null;
  }

  const photoUrl = getPhotoUrl(photo);
  if (photoUrl) {
    return (
      <div className="photo-content">
        <img src={photoUrl} alt="" />
      </div>
    );
  }

  const thumbnail = photo.minithumbnail;
  if (!thumbnail) {
    return null;
  }

  return (
    <div className="photo-content message-photo-thumbnail">
      <img src={`data:image/jpeg;base64, ${thumbnail.data}`} alt="" />
      <div className="message-photo-loading">
        <Spinner color="white" />
      </div>
    </div>
  );
}

function renderMessageSticker(sticker?: ApiSticker) {
  if (!sticker) {
    return null;
  }

  // TODO @mockup
  return (
    <p>{sticker.emoji}</p>
  );
}

export default withGlobal(
  (global, { message, showSenderName, showAvatar }: IProps) => {
    const replyMessage = selectChatMessage(global, message.chat_id, message.reply_to_message_id);
    if (!showSenderName && !showAvatar) {
      return { replyMessage };
    }

    return {
      sender: selectUser(global, message.sender_user_id),
      replyMessage,
    };
  },
)(Message);
