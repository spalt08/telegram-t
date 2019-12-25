import { MouseEvent } from 'react';
import React, {
  FC, memo, useEffect, useState,
} from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import {
  ApiUser,
  ApiMessage,
  ApiPhoto,
  ApiSticker,
  ApiVideo,
  ApiDocument,
} from '../../../../api/types';
import { selectUser, selectChatMessage } from '../../../../modules/selectors';
import { isOwnMessage, getUserFullName, getMessageMediaHash } from '../../../../modules/helpers';
import { getImageDimensions, getVideoDimensions, getStickerDimensions } from '../../../../util/imageDimensions';
import Avatar from '../../../../components/Avatar';
import Spinner from '../../../../components/Spinner';
import MessageMeta from './MessageMeta';
import ReplyMessage from './ReplyMessage';
import ContactMessage from './ContactMessage';
import { buildMessageContent } from './message/utils';
import './Message.scss';
import { formatMediaDuration } from '../../../../util/dateFormat';
import { getDocumentInfo } from '../../../../util/documentInfo';
import * as mediaLoader from '../../../../util/mediaLoader';
import AnimatedSticker from '../../../../components/AnimatedSticker';
import { DEBUG } from '../../../../config';

type OnClickHandler = (e: MouseEvent<HTMLDivElement>) => void;

type IProps = {
  message: ApiMessage;
  showAvatar?: boolean;
  showSenderName?: boolean;
  replyMessage?: ApiMessage;
  mediaHash?: string;
  sender?: ApiUser;
  originSender?: ApiUser;
  loadAndPlayMedia?: boolean;
} & Pick<GlobalActions, 'selectMediaMessage'>;

const Message: FC<IProps> = ({
  message,
  showAvatar,
  showSenderName,
  replyMessage,
  mediaHash,
  sender,
  originSender,
  loadAndPlayMedia,
  selectMediaMessage,
}) => {
  const [, onDataUriUpdate] = useState(null);
  const mediaData = mediaHash ? mediaLoader.getFromMemory(mediaHash) : undefined;

  useEffect(() => {
    const isAnimatedSticker = message.content.sticker && message.content.sticker.is_animated;
    if (mediaHash && loadAndPlayMedia && !mediaData) {
      mediaLoader.fetch(mediaHash, isAnimatedSticker).then(onDataUriUpdate);
    }
  }, [message, mediaHash, loadAndPlayMedia, mediaData]);

  const className = buildClassName(message, Boolean(mediaHash));
  const {
    text,
    photo,
    video,
    document,
    sticker,
    contact,
    className: contentClassName,
  } = buildMessageContent(message);
  const isText = contentClassName && contentClassName.includes('text');
  const isSticker = contentClassName && contentClassName.includes('sticker');
  const isForwarded = Boolean(message.forward_info);

  function openMediaMessage(): void {
    selectMediaMessage({ id: message.id });
  }

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
    if (replyMessage) {
      classNames.push('reply-message');
    }

    return (
      <div className={classNames.join(' ')}>
        {renderSenderName(isForwarded ? originSender : sender)}
        {replyMessage && <ReplyMessage message={replyMessage} />}
        {photo && renderMessagePhoto(photo, openMediaMessage, isOwnMessage(message), isForwarded, mediaData)}
        {video && renderMessageVideo(video, isOwnMessage(message), isForwarded)}
        {document && renderMessageDocument(document)}
        {sticker && renderMessageSticker(sticker, message.id, mediaData, loadAndPlayMedia)}
        {text && (
          <p>{text}</p>
        )}
        {contact && <ContactMessage contact={contact} />}
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
    <div className={className} data-message-id={message.id}>
      {showAvatar && (
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

function buildClassName(message: ApiMessage, hasMedia = false) {
  const classNames = ['Message'];

  if (isOwnMessage(message)) {
    classNames.push('own');
  }

  if (hasMedia) {
    classNames.push('has-media');
  }

  return classNames.join(' ');
}

function renderMessagePhoto(
  photo: ApiPhoto,
  clickHandler: OnClickHandler,
  fromOwnMessage: boolean,
  isForwarded: boolean,
  mediaData?: string,
) {
  const { width, height } = getImageDimensions(photo, fromOwnMessage, isForwarded);

  const thumbnail = photo.minithumbnail;
  if (!thumbnail) {
    return null;
  }

  return (
    <div
      className="media-content"
      tabIndex={-1}
      role="button"
      onClick={mediaData ? clickHandler : undefined}
    >
      <img
        src={`data:image/jpeg;base64, ${thumbnail.data}`}
        className="thumbnail-img"
        width={width}
        height={height}
        alt=""
      />
      <div className="message-media-loading">
        <Spinner color="white" />
      </div>
      <img
        src={mediaData}
        className={mediaData ? 'full-image loaded' : 'full-image'}
        width={width}
        height={height}
        alt=""
      />
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

function renderMessageSticker(
  sticker: ApiSticker,
  id: number,
  mediaData?: string,
  loadAndPlayMedia?: boolean,
) {
  const { thumbnail, is_animated } = sticker;
  const { width, height } = getStickerDimensions(sticker);

  let animationData: any;
  if (mediaData && is_animated) {
    try {
      animationData = JSON.parse(mediaData);
    } catch (err) {
      if (DEBUG) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
      animationData = undefined;
    }
  }

  return (
    <div className="media-content">
      <img
        src={thumbnail && thumbnail.dataUri}
        width={width}
        height={height}
        alt=""
        className={!thumbnail || mediaData ? 'thumbnail-image hidden' : 'thumbnail-image'}
      />
      {!is_animated && (
        <img
          src={mediaData}
          width={width}
          height={height}
          alt=""
          className={mediaData ? 'full-image loaded' : 'full-image'}
        />
      )}
      {is_animated && (
        <AnimatedSticker
          key={`sticker:${id}`}
          id={String(id)}
          animationData={animationData}
          width={width}
          height={height}
          play={!!loadAndPlayMedia}
          className={mediaData ? 'full-image loaded' : 'full-image'}
        />
      )}
    </div>
  );
}

export default memo(withGlobal(
  (global, { message, showSenderName, showAvatar }: IProps) => {
    // TODO: Works for only recent messages that are already loaded in the store
    const replyMessage = message.reply_to_message_id
      ? selectChatMessage(global, message.chat_id, message.reply_to_message_id)
      : undefined;

    const mediaHash = getMessageMediaHash(message);

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
      mediaHash,
      ...(userId && { sender: selectUser(global, userId) }),
      ...(originUserId && { originSender: selectUser(global, originUserId) }),
    };
  },
  (setGlobal, actions) => {
    const { selectMediaMessage } = actions;
    return { selectMediaMessage };
  },
)(Message));
