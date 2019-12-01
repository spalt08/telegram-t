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
import { getImageDimensions, getStickerDimensions } from '../../../../util/imageDimensions';
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
  originSender?: ApiUser;
};

const Message: FC<IProps> = (
  {
    message, showAvatar, showSenderName, replyMessage, fileDataUri, sender, originSender,
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
  const isSticker = contentClassName && contentClassName.includes('sticker');

  function renderSenderName(user?: ApiUser) {
    if (
      (!showSenderName && !message.forward_info)
      || (!user || !isText || photo)
    ) {
      return null;
    }

    return (
      <div className="sender-name">{getUserFullName(user)}</div>
    );
  }

  function renderMessageContent() {
    const isForwarded = Boolean(message.forward_info);

    const classNames = ['content-inner'];
    if (isForwarded) {
      classNames.push('forwarded-message');
    }
    if (replyMessage) {
      classNames.push('is-reply');
    }

    return (
      <div className={classNames.join(' ')}>
        {renderSenderName(isForwarded ? originSender : sender)}
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
      {showAvatar && sender && (
        <Avatar size="small" user={sender} />
      )}
      <div className={contentClassName}>
        {message.forward_info && !isSticker && (
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
  const { thumbnail } = sticker;
  const { width, height } = getStickerDimensions(sticker);

  return dataUri || thumbnail ? (
    <div className="photo-content">
      <img src={dataUri || (thumbnail && thumbnail.dataUri)} width={width} height={height} alt="" />
    </div>
  ) : (
    <p>{sticker.emoji}</p>
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
    let originUserId;
    if (showSenderName || showAvatar) {
      userId = message.sender_user_id;
    }
    if (message.forward_info) {
      originUserId = message.forward_info.origin.sender_user_id;
    }

    return {
      replyMessage,
      fileDataUri,
      ...(userId && { sender: selectUser(global, userId) }),
      ...(originUserId && { originSender: selectUser(global, originUserId) }),
    };
  },
)(Message);
