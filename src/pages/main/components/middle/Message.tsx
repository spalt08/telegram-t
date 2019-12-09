import React, { FC, memo } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import {
  ApiUser,
  ApiMessage,
  ApiPhoto,
  ApiSticker,
  ApiVideo,
  ApiDocument,
} from '../../../../api/types';
import { selectUser, selectChatMessage, selectMessageFileUrl } from '../../../../modules/selectors';
import { isOwnMessage, getUserFullName } from '../../../../modules/helpers';
import { getImageDimensions, getVideoDimensions, getStickerDimensions } from '../../../../util/imageDimensions';
import Avatar from '../../../../components/Avatar';
import Spinner from '../../../../components/Spinner';
import MessageMeta from './MessageMeta';
import ReplyMessage from './ReplyMessage';
import { buildMessageContent } from './message/utils';
import './Message.scss';
import { formatMediaDuration } from '../../../../util/dateFormat';
import { getDocumentInfo } from '../../../../util/documentInfo';

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
    video,
    document,
    sticker,
    className: contentClassName,
  } = buildMessageContent(message);
  const isText = contentClassName && contentClassName.includes('text');
  const isSticker = contentClassName && contentClassName.includes('sticker');
  const isForwarded = Boolean(message.forward_info);

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
    const classNames = ['content-inner'];
    if (isForwarded) {
      classNames.push('forwarded-message');
    }

    return (
      <div className={classNames.join(' ')}>
        {renderSenderName(isForwarded ? originSender : sender)}
        {replyMessage && <ReplyMessage message={replyMessage} />}
        {photo && renderMessagePhoto(photo, isOwnMessage(message), isForwarded, fileDataUri)}
        {video && renderMessageVideo(video, isOwnMessage(message), isForwarded)}
        {document && renderMessageDocument(document)}
        {sticker && renderMessageSticker(sticker, fileDataUri)}
        {text && (
          <p>{text}</p>
        )}
      </div>
    );
  }

  let style = '';
  if (photo || video) {
    const { width } = photo
      ? getImageDimensions(photo, isOwnMessage(message), isForwarded)
      : (video && getVideoDimensions(video, isOwnMessage(message), isForwarded)) || {};

    style = `width: ${width}px`;
  }

  return (
    <div className={className}>
      {showAvatar && sender && (
        <Avatar size="small" user={sender} />
      )}
      {/* eslint-disable-next-line */}
      <div className={contentClassName} style={style}>
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
      <div className="media-content">
        <img src={dataUri} width={width} height={height} alt="" />
      </div>
    );
  }

  const thumbnail = photo.minithumbnail;
  if (!thumbnail) {
    return null;
  }

  return (
    <div className="media-content message-media-thumbnail not-implemented">
      <img src={`data:image/jpeg;base64, ${thumbnail.data}`} width={width} height={height} alt="" />
      <div className="message-media-loading">
        <Spinner color="white" />
      </div>
    </div>
  );
}

function renderMessageVideo(video: ApiVideo, fromOwnMessage: boolean, isForwarded: boolean) {
  const { width, height } = getVideoDimensions(video, fromOwnMessage, isForwarded);

  const { minithumbnail, duration } = video;
  if (!minithumbnail) {
    return null;
  }

  return (
    <div className="media-content message-media-thumbnail not-implemented">
      <img src={`data:image/jpeg;base64, ${minithumbnail.data}`} width={width} height={height} alt="" />
      <div className="message-media-loading">
        <div className="message-media-play-button">
          <i className="icon-large-play" />
        </div>
      </div>
      <div className="message-media-duration">{formatMediaDuration(duration)}</div>
    </div>
  );
}

function renderMessageDocument(document: ApiDocument) {
  const { size, extension, color } = getDocumentInfo(document);
  const { fileName } = document;

  return (
    <div className="document-content not-implemented">
      <div className={`document-icon ${color}`}>
        {extension.length <= 4 && (
          <span className="document-ext">{extension}</span>
        )}
      </div>
      <div className="document-info">
        <div className="document-filename">{fileName}</div>
        <div className="document-size">{size}</div>
      </div>
    </div>
  );
}

function renderMessageSticker(sticker: ApiSticker, dataUri?: string) {
  const { thumbnail } = sticker;
  const { width, height } = getStickerDimensions(sticker);

  return dataUri || thumbnail ? (
    <div className="media-content">
      <img src={dataUri || (thumbnail && thumbnail.dataUri)} width={width} height={height} alt="" />
    </div>
  ) : (
    <p>{sticker.emoji}</p>
  );
}

export default memo(withGlobal(
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
)(Message));
