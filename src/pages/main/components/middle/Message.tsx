import { MouseEvent } from 'react';
import React, {
  FC, memo, useEffect, useState,
} from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';
import { GlobalActions } from '../../../../store/types';

import {
  ApiDocument, ApiMessage, ApiMessageOutgoingStatus, ApiPhoto, ApiSticker, ApiUser, ApiVideo,
} from '../../../../api/types';
import { selectChatMessage, selectOutgoingStatus, selectUser } from '../../../../modules/selectors';
import {
  getMessageMediaHash,
  getUserFullName,
  isOwnMessage,
  shouldMessageLoadMedia,
  shouldMessagePlayVideoInline,
} from '../../../../modules/helpers';
import { getImageDimensions, getStickerDimensions, getVideoDimensions } from '../../../../util/imageDimensions';
import { formatMediaDuration } from '../../../../util/dateFormat';
import { getDocumentInfo } from '../../../../util/documentInfo';
import * as mediaLoader from '../../../../util/mediaLoader';
import { buildMessageContent } from './message/utils';
import { disableScrolling, enableScrolling } from '../../../../util/scrollLock';

import Avatar from '../../../../components/Avatar';
import Spinner from '../../../../components/Spinner';
import AnimatedSticker from '../../../../components/AnimatedSticker';
import MessageMeta from './MessageMeta';
import ReplyMessage from './ReplyMessage';
import ContactMessage from './ContactMessage';
import MessageContextMenu from '../common/MessageContextMenu';
import './Message.scss';

const ANIMATION_TIMEOUT = 150;

type OnClickHandler = (e: MouseEvent<HTMLDivElement>) => void;

type IProps = {
  message: ApiMessage;
  showAvatar?: boolean;
  showSenderName?: boolean;
  loadAndPlayMedia?: boolean;
  sender?: ApiUser;
  mediaHash?: string;
  replyMessage?: ApiMessage;
  replyMessageSender?: ApiUser;
  originSender?: ApiUser;
  outgoingStatus?: ApiMessageOutgoingStatus;
} & Pick<GlobalActions, 'selectMediaMessage' | 'openUserInfo'>;

const Message: FC<IProps> = ({
  message,
  showAvatar,
  showSenderName,
  loadAndPlayMedia,
  mediaHash,
  sender,
  replyMessage,
  replyMessageSender,
  originSender,
  outgoingStatus,
  selectMediaMessage,
  openUserInfo,
}) => {
  const [, onDataUriUpdate] = useState(null);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);
  const mediaData = mediaHash ? mediaLoader.getFromMemory(mediaHash) : undefined;

  useEffect(() => {
    const isAnimatedSticker = message.content.sticker && message.content.sticker.is_animated;
    if (mediaHash && loadAndPlayMedia && !mediaData) {
      mediaLoader
        .fetch(mediaHash, isAnimatedSticker ? mediaLoader.Type.Lottie : mediaLoader.Type.BlobUrl)
        .then(onDataUriUpdate);
    }
  }, [message, mediaHash, loadAndPlayMedia, mediaData]);

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (contextMenuPosition !== null && (e.key === 'Esc' || e.key === 'Escape')) {
      e.stopPropagation();
      closeContextMenu();
    }
  };

  useEffect(() => {
    if (contextMenuPosition !== null) {
      window.document.body.addEventListener('keydown', handleKeyDown, false);
    }

    return () => {
      window.document.body.removeEventListener('keydown', handleKeyDown, false);
    };
  });

  const className = buildClassName(message, Boolean(mediaHash), contextMenuPosition !== null);
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

  function handleBeforeContextMenu(e: React.MouseEvent) {
    if (e.button === 2) {
      e.currentTarget.classList.add('no-selection');
    }
  }

  function showContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.currentTarget.classList.remove('no-selection');
    disableScrolling();

    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    requestAnimationFrame(() => {
      setIsContextMenuOpen(true);
    });
  }

  function closeContextMenu() {
    setIsContextMenuOpen(false);
    enableScrolling();
    setTimeout(() => {
      setContextMenuPosition(null);
    }, ANIMATION_TIMEOUT);
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

  function renderContent() {
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
        {replyMessage && <ReplyMessage message={replyMessage} sender={replyMessageSender} />}
        {photo && renderPhoto(photo, openMediaMessage, isOwnMessage(message), isForwarded, mediaData as string)}
        {video && renderVideo(
          video, openMediaMessage, isOwnMessage(message), isForwarded, mediaData as string, loadAndPlayMedia,
        )}
        {document && renderDocument(document)}
        {sticker && renderSticker(sticker, message.id, mediaData, loadAndPlayMedia)}
        {text && (
          <p>{text}</p>
        )}
        {contact && <ContactMessage contact={contact} />}
      </div>
    );
  }

  function viewUser() {
    if (!sender) {
      return;
    }
    openUserInfo({ id: sender.id });
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
        <Avatar size="small" user={sender} onClick={viewUser} />
      )}
      <div
        className={contentClassName}
        // @ts-ignore
        // eslint-disable-next-line
        style={style}
        onMouseDown={handleBeforeContextMenu}
        onContextMenu={showContextMenu}
      >
        {message.forward_info && !isSticker && (
          <div className="sender-name">Forwarded message</div>
        )}
        {renderContent()}
        <MessageMeta message={message} outgoingStatus={outgoingStatus} />
      </div>
      {contextMenuPosition !== null && (
        <MessageContextMenu
          messageId={message.id}
          isOpen={isContextMenuOpen}
          anchor={contextMenuPosition}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};

function buildClassName(message: ApiMessage, hasMedia = false, hasContextMenu = false) {
  const classNames = ['Message'];

  if (isOwnMessage(message)) {
    classNames.push('own');
  }

  if (hasMedia) {
    classNames.push('has-media');
  }

  if (hasContextMenu) {
    classNames.push('has-menu-open');
  }

  return classNames.join(' ');
}

function renderPhoto(
  photo: ApiPhoto,
  clickHandler: OnClickHandler,
  fromOwnMessage: boolean,
  isForwarded: boolean,
  mediaData?: string,
) {
  const { width, height } = getImageDimensions(photo, fromOwnMessage, isForwarded);
  const thumbData = photo.minithumbnail && photo.minithumbnail.data;

  return (
    <div
      className="media-content has-viewer"
      onClick={clickHandler}
    >
      <img
        src={thumbData && `data:image/jpeg;base64, ${thumbData}`}
        className={`thumbnail blur ${!thumbData ? 'empty' : ''}`}
        width={width}
        height={height}
        alt=""
      />
      {!mediaData && (
        <div className="message-media-loading">
          <Spinner color="white" />
        </div>
      )}
      <img
        src={mediaData}
        className={mediaData ? 'full-media fade-in' : 'full-media'}
        width={width}
        height={height}
        alt=""
      />
    </div>
  );
}

function renderVideo(
  video: ApiVideo,
  clickHandler: OnClickHandler,
  fromOwnMessage: boolean,
  isForwarded: boolean,
  mediaData?: string,
  loadAndPlayMedia?: boolean,
) {
  const { width, height } = getVideoDimensions(video, fromOwnMessage, isForwarded);
  const shouldPlayInline = shouldMessagePlayVideoInline(video);
  const isInlineVideo = mediaData && loadAndPlayMedia && shouldPlayInline;
  const isHqPreview = mediaData && !shouldPlayInline;
  const { minithumbnail, duration } = video;
  const thumbData = minithumbnail && minithumbnail.data;

  return (
    <div
      className="media-content has-viewer"
      onClick={clickHandler}
    >
      {isInlineVideo && (
        <video
          width={width}
          height={height}
          autoPlay
          muted
          loop
          playsinline
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...(thumbData && { poster: `data:image/jpeg;base64, ${thumbData}` })}
        >
          <source src={mediaData} />
        </video>
      )}
      {!isInlineVideo && isHqPreview && (
        <img src={mediaData} width={width} height={height} alt="" />
      )}
      {!isInlineVideo && !isHqPreview && (
        <img
          src={thumbData && `data:image/jpeg;base64, ${thumbData}`}
          width={width}
          height={height}
          alt=""
        />
      )}
      {!isInlineVideo && (
        <div className="message-media-loading">
          <div className="message-media-play-button">
            <i className="icon-large-play" />
          </div>
        </div>
      )}
      <div className="message-media-duration">{formatMediaDuration(duration)}</div>
    </div>
  );
}

function renderDocument(document: ApiDocument) {
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

function renderSticker(
  sticker: ApiSticker,
  id: number,
  mediaData?: string | AnyLiteral,
  loadAndPlayMedia?: boolean,
) {
  const { thumbnail, is_animated } = sticker;
  const { width, height } = getStickerDimensions(sticker);
  const thumbData = thumbnail && thumbnail.dataUri;

  let thumbClassName = 'thumbnail';
  if (thumbData && is_animated && mediaData) {
    thumbClassName += ' fade-out';
  } else if (!thumbData) {
    thumbClassName += ' empty';
  }

  return (
    <div className="media-content">
      <img
        src={thumbData}
        width={width}
        height={height}
        alt=""
        className={thumbClassName}
      />
      {!is_animated && (
        <img
          src={mediaData as string}
          width={width}
          height={height}
          alt=""
          className={mediaData ? 'full-media fade-in' : 'full-media'}
        />
      )}
      {is_animated && (
        <AnimatedSticker
          id={String(id)}
          animationData={mediaData as AnyLiteral}
          width={width}
          height={height}
          play={loadAndPlayMedia}
          className={mediaData ? 'full-media fade-in' : 'full-media'}
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

    const shouldLoadMedia = shouldMessageLoadMedia(message);
    const mediaHash = shouldLoadMedia ? getMessageMediaHash(message, true) : undefined;

    let userId;
    let originUserId;
    if (showSenderName || showAvatar) {
      userId = message.sender_user_id;
    }
    if (message.forward_info) {
      originUserId = message.forward_info.origin.sender_user_id;
    }

    return {
      mediaHash,
      ...(userId && { sender: selectUser(global, userId) }),
      ...(originUserId && { originSender: selectUser(global, originUserId) }),
      ...(replyMessage && {
        replyMessage,
        replyMessageSender: selectUser(global, replyMessage.sender_user_id),
      }),
      ...(message.is_outgoing && { outgoingStatus: selectOutgoingStatus(global, message) }),
    };
  },
  (setGlobal, actions) => {
    const { selectMediaMessage, openUserInfo } = actions;
    return { selectMediaMessage, openUserInfo };
  },
)(Message));
