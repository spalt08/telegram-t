import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import {
  ApiUser,
  ApiMessage,
  ApiPhoto,
  ApiSticker,
} from '../../../../api/types';
import { selectUser, selectChatMessage, selectMessageFileUrl } from '../../../../modules/selectors';
import { isOwnMessage, getUserFullName } from '../../../../modules/helpers';
import { getImageDimensions } from '../../../../util/imageDimensions';
import Avatar from '../../../../components/Avatar';
import Spinner from '../../../../components/Spinner';
import MessageMeta from './MessageMeta';
import ReplyMessage from './ReplyMessage';
import { buildMessageContent } from './util/messages';
import './Message.scss';

type IProps = {
  message: ApiMessage;
  showAvatar?: boolean;
  showSenderName?: boolean;
  replyMessage?: ApiMessage;
  fileDataUri?: string;
  sender?: ApiUser;
};

const Message: FC<IProps> = (
  {
    message, showAvatar, showSenderName, replyMessage, fileDataUri, sender,
  },
) => {
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
    const isForwarded = Boolean(message.forward_info);

    return (
      <div className={isForwarded ? 'forwarded-message' : ''}>
        {renderSenderName()}
        {replyMessage && <ReplyMessage message={replyMessage} />}
        {photo && renderMessagePhoto(photo, isOwnMessage(message), isForwarded, fileDataUri)}
        {sticker && renderMessageSticker(sticker, fileDataUri)}
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

function renderMessagePhoto(photo: ApiPhoto, fromOwnMessage: boolean, isForwarded: boolean, dataUri?: string) {
  const { width, height } = getImageDimensions(photo, fromOwnMessage, isForwarded);

  if (dataUri) {
    return (
      <div className="photo-content">
        <img src={dataUri} width={width} height={height} alt="" />
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

function renderMessageSticker(sticker: ApiSticker, dataUri?: string) {
  const { width, height, thumbnail } = sticker;

  return (
    <div className="photo-content">
      <img src={dataUri || thumbnail.dataUri} width={width} height={height} alt="" />
    </div>
  );
}

export default withGlobal(
  (global, { message, showSenderName, showAvatar }: IProps) => {
    // TODO: Works for only recent messages that are already loaded in the store
    const replyMessage = message.reply_to_message_id
      ? selectChatMessage(global, message.chat_id, message.reply_to_message_id)
      : undefined;

    const fileDataUri = selectMessageFileUrl(global, message);

    let userId;
    if (message.forward_info) {
      userId = message.forward_info.origin.sender_user_id;
    } else if (showSenderName || showAvatar) {
      userId = message.sender_user_id;
    }

    return {
      replyMessage,
      fileDataUri,
      ...(userId && { sender: selectUser(global, userId) }),
    };
  },
)(Message);
