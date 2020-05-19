import React, {
  FC, memo, useCallback, useLayoutEffect, useRef, useState, useEffect,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import {
  ApiMessage,
  ApiMessageOutgoingStatus,
  ApiUser,
  ApiChat,
} from '../../../api/types';
import { FocusDirection, IAlbum, MediaViewerOrigin } from '../../../types';

import { IS_TOUCH_ENV } from '../../../util/environment';
import { pick } from '../../../util/iteratees';
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
  getMessageVideo,
  isChatPrivate,
  getChatTitle,
} from '../../../modules/helpers';
import { getMessageCustomShape } from '../../../modules/helpers/messageShape';
import fastSmoothScroll from '../../../util/fastSmoothScroll';
import buildClassName from '../../../util/buildClassName';
import useEnsureMessage from '../../../hooks/useEnsureMessage';
import { renderMessageText } from '../../common/helpers/renderMessageText';
import { ROUND_VIDEO_DIMENSIONS } from '../../common/helpers/mediaDimensions';
import { buildContentClassName } from './helpers/buildContentClassName';
import { getMinMediaWidth, calculateMediaDimensions } from './helpers/mediaDimensions';

import Avatar from '../../common/Avatar';
import EmbeddedMessage from '../../common/EmbeddedMessage';
import Document from '../../common/Document';
import Audio from '../../common/Audio';
import MessageMeta from './MessageMeta';
import ContextMenuContainer from './ContextMenuContainer.async';
import { IAnchorPosition } from './ContextMenuContainer';
import Sticker from './Sticker';
import Photo from './Photo';
import Video from './Video';
import Contact from './Contact';
import Poll from './Poll';
import WebPage from './WebPage';
import Album from './Album';
import RoundVideo from './RoundVideo';

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
  replyMessageSender?: ApiUser | ApiChat;
  originSender?: ApiUser | ApiChat;
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
  'focusMessage' | 'openMediaViewer' |
  'openUserInfo' | 'openChat' |
  'cancelSendingMessage' | 'markMessagesRead' |
  'sendPollVote'
)>;

// This is the max scroll offset within existing viewport.
const FOCUS_MAX_OFFSET = 2000;
// This is used when the viewport was replaced.
const RELOCATED_FOCUS_OFFSET = 1200;
const LONG_TAP_DURATION_MS = 250;
const NBSP = '\u00A0';

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
  openChat,
  cancelSendingMessage,
  markMessagesRead,
  sendPollVote,
}) => {
  const elementRef = useRef<HTMLDivElement>();
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<IAnchorPosition | undefined>(undefined);

  const { chatId, id: messageId } = message;

  useEnsureMessage(chatId, message.replyToMessageId, replyMessage);

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
  const isContextMenuShown = contextMenuPosition !== undefined;
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
    message.isDeleting && 'is-deleting',
    isAlbum && 'is-album',
    message.hasUnreadMention && 'has-unread-mention',
  );
  const customShape = getMessageCustomShape(message);
  const contentClassName = buildContentClassName(message, {
    hasReply, customShape, isLastInGroup,
  });

  const handleSenderClick = useCallback((chatOrUser?: ApiUser | ApiChat) => {
    if (!chatOrUser) {
      return;
    }

    if (isChatPrivate(chatOrUser.id)) {
      openUserInfo({ id: chatOrUser.id });
    } else {
      openChat({ id: chatOrUser.id });
    }
  }, [openUserInfo, openChat]);

  const handleReplyClick = useCallback((): void => {
    focusMessage({ chatId, messageId: message.replyToMessageId });
  }, [focusMessage, chatId, message.replyToMessageId]);

  const handleMediaClick = useCallback((): void => {
    openMediaViewer({ chatId, messageId, origin: MediaViewerOrigin.Inline });
  }, [chatId, messageId, openMediaViewer]);

  const handleAlbumMediaClick = useCallback((albumMessageId: number): void => {
    openMediaViewer({ chatId, messageId: albumMessageId, origin: MediaViewerOrigin.Album });
  }, [chatId, openMediaViewer]);

  const handleReadMedia = useCallback((): void => {
    markMessagesRead({ messageIds: [messageId] });
  }, [messageId, markMessagesRead]);

  const handleCancelUpload = useCallback(() => {
    cancelSendingMessage({ chatId: message.chatId, messageId: message.id });
  }, [cancelSendingMessage, message.chatId, message.id]);

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
    setContextMenuPosition(undefined);
  }, []);

  // Support context menu on touch-devices
  useEffect(() => {
    if (!IS_TOUCH_ENV) {
      return undefined;
    }

    const messageEl = elementRef.current;
    if (!messageEl) {
      return undefined;
    }

    let timer: number;

    const clearLongPressTimer = () => {
      if (timer) {
        clearTimeout(timer);
      }
    };

    const emulateContextMenuEvent = (originalEvent: TouchEvent) => {
      clearLongPressTimer();

      const { clientX, clientY } = originalEvent.touches[0];

      if (contextMenuPosition) {
        return;
      }

      // temporarily intercept and clear the next click
      messageEl.addEventListener('touchend', function cancelClickOnce(e) {
        messageEl.removeEventListener('touchend', cancelClickOnce, true);
        e.stopImmediatePropagation();
        e.preventDefault();
        e.stopPropagation();
      }, true);

      setIsContextMenuOpen(true);
      setContextMenuPosition({ x: clientX, y: clientY });
    };

    const startLongPressTimer = (e: TouchEvent) => {
      clearLongPressTimer();
      timer = window.setTimeout(() => emulateContextMenuEvent(e), LONG_TAP_DURATION_MS);
    };

    // @peft Consider event delegation
    messageEl.addEventListener('touchstart', startLongPressTimer, true);
    messageEl.addEventListener('touchcancel', clearLongPressTimer, true);
    messageEl.addEventListener('touchend', clearLongPressTimer, true);
    messageEl.addEventListener('touchmove', clearLongPressTimer, true);

    return () => {
      clearLongPressTimer();
      messageEl.removeEventListener('touchstart', startLongPressTimer, true);
      messageEl.removeEventListener('touchcancel', clearLongPressTimer, true);
      messageEl.removeEventListener('touchend', clearLongPressTimer, true);
      messageEl.removeEventListener('touchmove', clearLongPressTimer, true);
    };
  }, [contextMenuPosition]);

  const handleVoteSend = useCallback((options: string[]) => {
    sendPollVote({ chatId, messageId, options });
  }, [chatId, messageId, sendPollVote]);

  function renderSenderName(userOrChat?: ApiUser | ApiChat) {
    if (
      (!showSenderName && !message.forwardInfo)
      || !userOrChat || photo || video || customShape
    ) {
      return undefined;
    }

    const senderTitle = (
      isChatPrivate(userOrChat.id)
        ? getUserFullName(userOrChat as ApiUser)
        : getChatTitle(userOrChat as ApiChat)
    );

    return (
      <div className="message-title interactive" onClick={() => handleSenderClick(userOrChat)}>
        {senderTitle || NBSP}
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
            hasCustomAppendix={isLastInGroup && !text}
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
        {!album && video && video.isRound && (
          <RoundVideo
            message={message}
            loadAndPlay={loadAndPlayMedia}
            lastSyncTime={lastSyncTime}
          />
        )}
        {!album && video && !video.isRound && (
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
            load={loadAndPlayMedia}
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
    let width: number | undefined;
    if (photo) {
      width = calculateMediaDimensions(message).width;
    } else if (video) {
      if (video.isRound) {
        width = ROUND_VIDEO_DIMENSIONS;
      } else {
        width = calculateMediaDimensions(message).width;
      }
    }

    if (width) {
      const calculatedWidth = Math.max(getMinMediaWidth(Boolean(text)), width);
      const extraPadding = isForwarded ? 28 : 0;
      style = `width: ${calculatedWidth + extraPadding}px`;
    }
  }

  return (
    <div
      ref={elementRef}
      id={`message${messageId}`}
      className={containerClassName}
      data-message-id={messageId}
    >
      {showAvatar && isLastInGroup && (
        <Avatar
          size="small"
          user={sender}
          onClick={() => handleSenderClick(sender)}
        />
      )}
      <div
        className={contentClassName}
        // @ts-ignore
        style={style}
        onMouseDown={handleBeforeContextMenu}
        onContextMenu={handleContextMenu}
      >
        {message.forwardInfo && !customShape && (
          <div className="message-title">Forwarded message</div>
        )}
        {renderContent()}
        <MessageMeta message={message} outgoingStatus={outgoingStatus} />
      </div>
      {contextMenuPosition && (
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
    const { chatId } = message;

    const replyMessage = message.replyToMessageId
      ? selectChatMessage(global, chatId, message.replyToMessageId)
      : undefined;
    const replyMessageSender = replyMessage && (replyMessage.senderUserId
      ? selectUser(global, replyMessage.senderUserId)
      : selectChat(global, replyMessage.chatId));

    let userId;
    let originSender;
    if (showSenderName || showAvatar) {
      userId = message.senderUserId;
    }
    if (message.forwardInfo) {
      const originUserId = message.forwardInfo.origin.senderUserId;
      const originChatId = message.forwardInfo.fromChatId;
      if (originUserId) {
        originSender = selectUser(global, originUserId);
      } else if (originChatId) {
        originSender = selectChat(global, originChatId);
      }
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
      originSender,
      replyMessage,
      replyMessageSender,
      ...(message.isOutgoing && { outgoingStatus: selectOutgoingStatus(global, message) }),
      ...(typeof uploadProgress === 'number' && { uploadProgress }),
      isFocused,
      ...(isFocused && { focusDirection, noFocusHighlight }),
      isSelectedToForward,
      isChatWithSelf,
      // Heavy inline videos are never cached and should be re-fetched after connection.
      ...(isVideo && { lastSyncTime }),
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'focusMessage',
    'openMediaViewer',
    'cancelSendingMessage',
    'openUserInfo',
    'openChat',
    'markMessagesRead',
    'sendPollVote',
  ]),
)(Message));
