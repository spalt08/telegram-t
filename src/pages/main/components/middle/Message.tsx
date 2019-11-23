import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import {
  ApiUser,
  ApiMessage,
  ApiPhoto,
  ApiSticker,
} from '../../../../api/types';
import {
  isOwnMessage,
  getUserFullName,
  getPhotoUrl,
} from '../../../../modules/helpers';
import { selectUser, selectChatMessage } from '../../../../modules/selectors';
import { getImageDimensions } from '../../../../util/imageDimensions';

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

  function renderSenderName() {
    if (
      (!showSenderName && !message.forward_info)
      || (!sender || !isText || photo)
    ) {
      return null;
    }

    return (
      <div className="sender-name">{getUserFullName(sender)}</div>
    );
  }

  function renderMessageContent() {
    return (
      <div className={message.forward_info ? 'forwarded-message' : ''}>
        {renderSenderName()}
        {replyMessage && <ReplyMessage message={replyMessage} />}
        {renderMessagePhoto(photo, isOwnMessage(message), !!message.forward_info)}
        {renderMessageSticker(sticker)}
        {text && (
          <p>{text}</p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {showAvatar && sender && !message.forward_info && (
        <Avatar size="small" user={sender} />
      )}
      <div className={contentClassName}>
        {message.forward_info && (
          <div className="sender-name">Forwarded message</div>
        )}
        {renderMessageContent()}
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

function renderMessagePhoto(photo: ApiPhoto | undefined, fromOwnMessage: boolean, isForwarded: boolean) {
  if (!photo) {
    return null;
  }

  const { width, height } = getImageDimensions(photo, fromOwnMessage, isForwarded);

  const photoUrl = getPhotoUrl(photo);
  if (photoUrl) {
    return (
      <div className="photo-content">
        <img src={photoUrl} width={width} height={height} alt="" />
      </div>
    );
  }

  const thumbnail = photo.minithumbnail;
  if (!thumbnail) {
    return null;
  }

  return (
    <div className="photo-content message-photo-thumbnail not-implemented">
      <img src={`data:image/jpeg;base64, ${thumbnail.data}`} width={width} height={height} alt="" />
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
    // TODO: Works for only recent messages that are already loaded in the store
    const replyMessage = message.reply_to_message_id
      ? selectChatMessage(global, message.chat_id, message.reply_to_message_id)
      : undefined;
    if (!showSenderName && !showAvatar && !message.forward_info) {
      return { replyMessage };
    }

    const userId = message.forward_info ? message.forward_info.origin.sender_user_id : message.sender_user_id;

    return {
      sender: selectUser(global, userId),
      replyMessage,
    };
  },
)(Message);
