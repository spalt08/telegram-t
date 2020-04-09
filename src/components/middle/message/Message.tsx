import React, {
  FC, memo, useCallback, useLayoutEffect, useRef, useState,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiMessage, ApiMessageOutgoingStatus, ApiUser } from '../../../api/types';
import { FocusDirection, IAlbum } from '../../../types';

import {
  selectChat,
  selectChatMessage,
  selectUploadProgress,
  selectIsChatWithSelf,
  selectOutgoingStatus,
  selectUser,
  selectIsMessageFocused,
} from '../../../modules/selectors';
import {
  getMessageContent,
  getMessageMediaHash,
  getUserFullName,
  hasMessageLocalBlobUrl,
  isOwnMessage,
  isReplyMessage,
  isForwardedMessage,
  getMessageCustomShape,
  getMessageVideo,
} from '../../../modules/helpers';
import fastSmoothScroll from '../../../util/fastSmoothScroll';
import buildClassName from '../../../util/buildClassName';
import useEnsureMessage from '../../../hooks/useEnsureMessage';
import { renderMessageText } from '../../common/helpers/renderMessageText';
import { calculateInlineImageDimensions, calculateVideoDimensions } from '../../common/helpers/mediaDimensions';
import { buildContentClassName } from './helpers/buildContentClassName';
import { getMinMediaWidth } from './helpers/mediaDimensions';

import Avatar from '../../common/Avatar';
import EmbeddedMessage from '../../common/EmbeddedMessage';
import Document from '../../common/Document';
import Audio from '../../common/Audio';
import MessageMeta from './MessageMeta';
import ContextMenuContainer from './ContextMenuContainer.async';
import Sticker from './Sticker';
import Photo from './Photo';
import Video from './Video';
import Contact from './Contact';
import Poll from './Poll';
import WebPage from './WebPage';
import Album from './Album';

import './Message.scss';

type MessagePositionProperties = {
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  isLastInList: boolean;
};

type OwnProps = {
  message: ApiMessage;
  album?: IAlbum;
  showAvatar?: boolean;
  showSenderName?: boolean;
  loadAndPlayMedia?: boolean;
} & MessagePositionProperties;

type StateProps = {
  sender?: ApiUser;
  replyMessage?: ApiMessage;
  replyMessageSender?: ApiUser;
  originSender?: ApiUser;
  outgoingStatus?: ApiMessageOutgoingStatus;
  uploadProgress?: number;
  isFocused?: boolean;
  focusDirection?: FocusDirection;
  noFocusHighlight?: boolean;
  isSelectedToForward?: boolean;
  isChatWithSelf?: boolean;
  lastSyncTime?: number;
};

type DispatchProps = Pick<GlobalActions, (
  'focusMessage' | 'openMediaViewer' | 'openUserInfo' | 'cancelSendingMessage' | 'readMessageContents' | 'sendPollVote'
)>;

const NBSP = '\u00A0';

// This is the max scroll offset within existing viewport.
const FOCUS_MAX_OFFSET = 2000;
// This is used when the viewport was replaced.
const RELOCATED_FOCUS_OFFSET = 1200;

const Message: FC<OwnProps & StateProps & DispatchProps> = ({
  message,
  album,
  showAvatar,
  showSenderName,
  loadAndPlayMedia,
  sender,
  replyMessage,
  replyMessageSender,
  originSender,
  outgoingStatus,
  uploadProgress,
  isFocused,
  focusDirection,
  noFocusHighlight,
  isSelectedToForward,
  isChatWithSelf,
  lastSyncTime,
  isFirstInGroup,
  isLastInGroup,
  isLastInList,
  focusMessage,
  openMediaViewer,
  openUserInfo,
  cancelSendingMessage,
  readMessageContents,
  sendPollVote,
}) => {
  const elementRef = useRef<HTMLDivElement>();
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);

  const { chat_id: chatId, id: messageId } = message;

  useEnsureMessage(chatId, message.reply_to_message_id, replyMessage);

  useLayoutEffect(() => {
    const messagesContainer = window.document.getElementById('MessageList');
    if (isFocused && elementRef.current && messagesContainer) {
      fastSmoothScroll(
        messagesContainer,
        elementRef.current,
        'center',
        focusDirection === undefined ? FOCUS_MAX_OFFSET : RELOCATED_FOCUS_OFFSET,
        focusDirection,
      );
    }
  }, [isFocused, chatId, focusMessage, focusDirection]);

  const isOwn = isOwnMessage(message);
  const hasReply = isReplyMessage(message);
  const isForwarded = isForwardedMessage(message);
  const isAlbum = Boolean(album);
  const {
    text, photo, video, audio, voice, document, sticker, contact, poll, webPage,
  } = getMessageContent(message);
  const textParts = renderMessageText(message);
  const hasMedia = (
    getMessageMediaHash(message, 'inline')
    || hasMessageLocalBlobUrl(message)
    || (replyMessage && getMessageMediaHash(replyMessage, 'pictogram'))
  );
  const isContextMenuShown = contextMenuPosition !== null;
  const containerClassName = buildClassName(
    'Message message-list-item',
    isFirstInGroup && 'first-in-group',
    isLastInGroup && 'last-in-group',
    isLastInList && 'last-in-list',
    isOwn && 'own',
    Boolean(message.views) && 'has-views',
    message.isEdited && 'was-edited',
    hasMedia && 'has-media',
    hasReply && 'has-reply',
    isContextMenuShown && 'has-menu-open',
    isFocused && !noFocusHighlight && 'focused',
    isSelectedToForward && 'is-forwarding',
    message.is_deleting && 'is-deleting',
    isAlbum && 'is-album',
  );
  const customShape = getMessageCustomShape(message);
  const contentClassName = buildContentClassName(message, {
    hasReply, customShape, isLastInGroup, isAlbum,
  });

  const handleSenderClick = useCallback((user?: ApiUser) => {
    if (!user) {
      return;
    }
    openUserInfo({ id: user.id });
  }, [openUserInfo]);

  const handleReplyClick = useCallback((): void => {
    focusMessage({ chatId, messageId: message.reply_to_message_id });
  }, [focusMessage, chatId, message.reply_to_message_id]);

  const handleMediaClick = useCallback((): void => {
    openMediaViewer({ chatId, messageId });
  }, [chatId, messageId, openMediaViewer]);

  const handleAlbumMediaClick = useCallback((albumMessageId: number): void => {
    openMediaViewer({ chatId, messageId: albumMessageId });
  }, [chatId, openMediaViewer]);

  const handleReadMedia = useCallback((): void => {
    readMessageContents({ messageId });
  }, [messageId, readMessageContents]);

  const handleCancelUpload = useCallback(() => {
    cancelSendingMessage({ chatId: message.chat_id, messageId: message.id });
  }, [cancelSendingMessage, message.chat_id, message.id]);

  const handleBeforeContextMenu = useCallback((e: React.MouseEvent) => {
    if (e.button === 2) {
      e.currentTarget.classList.add('no-selection');
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('no-selection');

    if (contextMenuPosition) {
      return;
    }

    setIsContextMenuOpen(true);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  }, [contextMenuPosition]);

  const handleContextMenuClose = useCallback(() => {
    setIsContextMenuOpen(false);
  }, []);

  const handleContextMenuHide = useCallback(() => {
    setContextMenuPosition(null);
  }, []);

  const handleVoteSend = useCallback((options: string[]) => {
    sendPollVote({ chatId, messageId, options });
  }, [chatId, messageId, sendPollVote]);

  function renderSenderName(user?: ApiUser) {
    if (
      (!showSenderName && !message.forward_info)
      || !user || photo || video || customShape
    ) {
      return null;
    }

    return (
      <div className="message-title interactive" onClick={() => handleSenderClick(user)}>
        {user ? getUserFullName(user) : NBSP}
      </div>
    );
  }

  function renderContent() {
    const className = buildClassName(
      'content-inner',
      isForwarded && !customShape && 'forwarded-message',
      hasReply && 'reply-message',
    );

    return (
      <div className={className}>
        {renderSenderName(isForwarded ? originSender : sender)}
        {hasReply && (
          <EmbeddedMessage
            message={replyMessage}
            sender={replyMessageSender}
            loadPictogram={loadAndPlayMedia}
            onClick={handleReplyClick}
          />
        )}
        {sticker && (
          <Sticker
            message={message}
            loadAndPlay={loadAndPlayMedia}
          />
        )}
        {album && (
          <Album
            album={album}
            loadAndPlay={loadAndPlayMedia}
            onMediaClick={handleAlbumMediaClick}
          />
        )}
        {!album && photo && (
          <Photo
            message={message}
            load={loadAndPlayMedia}
            uploadProgress={uploadProgress}
            shouldAffectAppendix={isLastInGroup && !textParts && !isForwarded}
            onClick={handleMediaClick}
            onCancelUpload={handleCancelUpload}
          />
        )}
        {!album && video && (
          <Video
            message={message}
            loadAndPlay={loadAndPlayMedia}
            uploadProgress={uploadProgress}
            lastSyncTime={lastSyncTime}
            onClick={handleMediaClick}
            onCancelUpload={handleCancelUpload}
          />
        )}
        {(audio || voice) && (
          <Audio
            message={message}
            loadAndPlay={loadAndPlayMedia}
            uploadProgress={uploadProgress}
            onReadMedia={voice && (!isOwn || isChatWithSelf) ? handleReadMedia : undefined}
            onCancelUpload={handleCancelUpload}
          />
        )}
        {document && (
          <Document
            message={message}
            uploadProgress={uploadProgress}
            onCancelUpload={handleCancelUpload}
          />
        )}
        {contact && (
          <Contact contact={contact} />
        )}
        {poll && (
          <Poll messageId={message.id} poll={poll} onSendVote={handleVoteSend} />
        )}
        {textParts && <p className="text-content">{textParts}</p>}
        {webPage && (
          <WebPage
            message={message}
            load={loadAndPlayMedia}
            onMediaClick={handleMediaClick}
            onCancelMediaTransfer={handleCancelUpload}
          />
        )}
      </div>
    );
  }

  let style = '';
  if (!isAlbum && (photo || video)) {
    const { width } = photo
      ? calculateInlineImageDimensions(photo, isOwn, isForwarded)
      : (video && calculateVideoDimensions(video, isOwn, isForwarded)) || {};

    if (width) {
      const calculatedWidth = Math.max(getMinMediaWidth(Boolean(text)), width);
      style = `width: ${calculatedWidth}px`;
    }
  }

  return (
    <div
      ref={elementRef}
      id={`message${messageId}`}
      className={containerClassName}
      data-message-id={messageId}
    >
      {showAvatar && (
        <Avatar
          size="small"
          user={sender}
          onClick={() => handleSenderClick(sender)}
          className={!isLastInGroup ? 'hidden' : ''}
        />
      )}
      <div
        className={contentClassName}
        // @ts-ignore
        style={style}
        onMouseDown={handleBeforeContextMenu}
        onContextMenu={handleContextMenu}
      >
        {message.forward_info && !customShape && (
          <div className="message-title">Forwarded message</div>
        )}
        {renderContent()}
        <MessageMeta message={message} outgoingStatus={outgoingStatus} />
      </div>
      {Boolean(contextMenuPosition) && (
        <ContextMenuContainer
          isOpen={isContextMenuOpen}
          anchor={contextMenuPosition}
          message={message}
          onClose={handleContextMenuClose}
          onCloseAnimationEnd={handleContextMenuHide}
        />
      )}
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, ownProps): StateProps => {
    const {
      message, album, showSenderName, showAvatar,
    } = ownProps;
    const chatId = message.chat_id;

    const replyMessage = message.reply_to_message_id
      ? selectChatMessage(global, chatId, message.reply_to_message_id)
      : undefined;
    const replyMessageSender = replyMessage && replyMessage.sender_user_id
      ? selectUser(global, replyMessage.sender_user_id)
      : undefined;

    let userId;
    let originUserId;
    if (showSenderName || showAvatar) {
      userId = message.sender_user_id;
    }
    if (message.forward_info) {
      originUserId = message.forward_info.origin.sender_user_id;
    }

    const uploadProgress = selectUploadProgress(global, message);
    const isFocused = album
      ? album.messages.some((m) => selectIsMessageFocused(global, m))
      : selectIsMessageFocused(global, message);
    const { direction: focusDirection, noHighlight: noFocusHighlight } = (isFocused && global.focusedMessage) || {};

    const chat = selectChat(global, chatId);
    const isChatWithSelf = chat && selectIsChatWithSelf(global, chat);

    const { messageIds } = global.forwardMessages;
    const isSelectedToForward = messageIds && messageIds.includes(message.id);

    const isVideo = Boolean(getMessageVideo(message));
    const { lastSyncTime } = global;

    return {
      ...(userId && { sender: selectUser(global, userId) }),
      ...(originUserId && { originSender: selectUser(global, originUserId) }),
      replyMessage,
      replyMessageSender,
      ...(message.is_outgoing && { outgoingStatus: selectOutgoingStatus(global, message) }),
      ...(typeof uploadProgress === 'number' && { uploadProgress }),
      isFocused,
      ...(isFocused && { focusDirection, noFocusHighlight }),
      isSelectedToForward,
      isChatWithSelf,
      // Heavy inline videos are never cached and should be re-fetched after connection.
      ...(isVideo && { lastSyncTime }),
    };
  },
  (setGlobal, actions): DispatchProps => {
    const {
      focusMessage,
      openMediaViewer,
      cancelSendingMessage,
      openUserInfo,
      readMessageContents,
      sendPollVote,
    } = actions;
    return {
      focusMessage,
      openMediaViewer,
      cancelSendingMessage,
      openUserInfo,
      readMessageContents,
      sendPollVote,
    };
  },
)(Message));
