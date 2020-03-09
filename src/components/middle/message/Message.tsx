import React, {
  FC, memo, useCallback, useLayoutEffect, useRef, useState,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiMessage, ApiMessageOutgoingStatus, ApiUser } from '../../../api/types';
import { FocusDirection } from '../../../types';

import {
  selectChat,
  selectFocusedMessageId,
  selectChatMessage,
  selectFileTransferProgress,
  selectIsChatWithSelf,
  selectOutgoingStatus,
  selectUser,
  selectFocusDirection,
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
} from '../../../modules/helpers';
import fastSmoothScroll from '../../../util/fastSmoothScroll';
import buildClassName from '../../../util/buildClassName';
import useEnsureMessage from '../../../hooks/useEnsureMessage';
import { renderMessageText } from '../../common/helpers/renderMessageText';
import { calculateInlineImageDimensions, calculateVideoDimensions } from '../../common/helpers/mediaDimensions';
import { buildContentClassName } from './helpers/buildContentClassName';
import { getMinMediaWidth } from './helpers/mediaDimensions';

import Avatar from '../../common/Avatar';
import MessageMeta from './MessageMeta';
import ReplyMessage from '../../common/ReplyMessage';
import ContextMenuContainer from './ContextMenuContainer';

import Sticker from './Sticker';
import Document from './Document';
import Video from './Video';
import Photo from './Photo';
import Contact from './Contact';
import Poll from './Poll';
import WebPage from './WebPage';
import Audio from './Audio';

import './Message.scss';

type MessagePositionProperties = {
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  isLastInList: boolean;
};

type IProps = (
  {
    message: ApiMessage;
    showAvatar?: boolean;
    showSenderName?: boolean;
    loadAndPlayMedia?: boolean;
    sender?: ApiUser;
    replyMessage?: ApiMessage;
    replyMessageSender?: ApiUser;
    originSender?: ApiUser;
    canDelete?: boolean;
    contactFirstName: string | null;
    outgoingStatus?: ApiMessageOutgoingStatus;
    fileTransferProgress?: number;
    isFocused?: boolean;
    focusDirection?: FocusDirection;
    isChatWithSelf?: boolean;
  }
  & MessagePositionProperties
  & Pick<GlobalActions, (
    'focusMessage' | 'openMediaViewer' | 'openUserInfo' |
    'cancelSendingMessage' | 'readMessageContents' | 'sendPollVote'
  )>
);

const NBSP = '\u00A0';

// This is the max scroll offset within existing viewport.
const FOCUS_MAX_OFFSET = 2000;
// This is used when the viewport was replaced.
const RELOCATED_FOCUS_OFFSET = 1000;

const Message: FC<IProps> = ({
  message,
  showAvatar,
  showSenderName,
  loadAndPlayMedia,
  sender,
  replyMessage,
  replyMessageSender,
  originSender,
  outgoingStatus,
  fileTransferProgress,
  isFocused,
  focusDirection,
  isChatWithSelf,
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
  const isReply = isReplyMessage(message);
  const isForwarded = isForwardedMessage(message);
  const {
    text, photo, video, audio, voice, document, sticker, contact, poll, webPage,
  } = getMessageContent(message);
  const textParts = renderMessageText(text);
  const hasMedia = (
    getMessageMediaHash(message, 'inline')
    || hasMessageLocalBlobUrl(message)
    || (replyMessage && getMessageMediaHash(replyMessage, 'pictogram'))
  );
  const isContextMenuShown = contextMenuPosition !== null;
  const containerClassName = buildClassName(
    'Message',
    isFirstInGroup && 'first-in-group',
    isLastInGroup && 'last-in-group',
    isLastInList && 'last-in-list',
    isOwn && 'own',
    Boolean(message.views) && 'has-views',
    message.isEdited && 'was-edited',
    hasMedia && 'has-media',
    isReply && 'has-reply',
    isContextMenuShown && 'has-menu-open',
    isFocused && 'focused',
    message.is_deleting && 'is-deleting',
  );
  const customShape = getMessageCustomShape(message);
  const contentClassName = buildContentClassName(message, {
    isOwn, isLastInGroup, hasReply: isReply, customShape,
  });

  const handleAvatarClick = useCallback(() => {
    if (!sender) {
      return;
    }
    openUserInfo({ id: sender.id });
  }, [openUserInfo, sender]);

  const handleReplyClick = useCallback((): void => {
    focusMessage({ chatId, messageId: message.reply_to_message_id });
  }, [focusMessage, chatId, message.reply_to_message_id]);

  const handleMediaClick = useCallback((): void => {
    openMediaViewer({ chatId, messageId });
  }, [chatId, messageId, openMediaViewer]);

  const handleReadMedia = useCallback((): void => {
    readMessageContents({ messageId });
  }, [messageId, readMessageContents]);

  const handleCancelTransfer = useCallback(() => {
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
      <div className="sender-name">{user ? getUserFullName(user) : NBSP}</div>
    );
  }

  function renderContent() {
    const className = buildClassName(
      'content-inner',
      isForwarded && !customShape && 'forwarded-message',
      isReply && 'reply-message',
    );

    return (
      <div className={className}>
        {renderSenderName(isForwarded ? originSender : sender)}
        {isReply && (
          <ReplyMessage
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
        {photo && (
          <Photo
            message={message}
            load={loadAndPlayMedia}
            fileTransferProgress={fileTransferProgress}
            onClick={handleMediaClick}
            onCancelTransfer={handleCancelTransfer}
          />
        )}
        {video && (
          <Video
            message={message}
            loadAndPlay={loadAndPlayMedia}
            fileTransferProgress={fileTransferProgress}
            onClick={handleMediaClick}
            onCancelTransfer={handleCancelTransfer}
          />
        )}
        {(audio || voice) && (
          <Audio
            message={message}
            loadAndPlay={loadAndPlayMedia}
            fileTransferProgress={fileTransferProgress}
            onReadMedia={voice && (!isOwn || isChatWithSelf) ? handleReadMedia : undefined}
            onCancelTransfer={handleCancelTransfer}
          />
        )}
        {document && (
          <Document
            message={message}
            fileTransferProgress={fileTransferProgress}
            onCancelTransfer={handleCancelTransfer}
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
            onCancelMediaTransfer={handleCancelTransfer}
          />
        )}
      </div>
    );
  }

  let style = '';
  if (photo || video) {
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
          onClick={handleAvatarClick}
          className={!isLastInGroup ? 'hidden' : ''}
          noAnimate
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
          <div className="sender-name">Forwarded message</div>
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

export default memo(withGlobal(
  (global, ownProps: IProps) => {
    const { message, showSenderName, showAvatar } = ownProps;
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

    const fileTransferProgress = selectFileTransferProgress(global, message);
    const isFocused = message.id === selectFocusedMessageId(global, chatId);
    const focusDirection = isFocused ? selectFocusDirection(global, chatId) : undefined;

    const chat = selectChat(global, chatId);
    const isChatWithSelf = chat && selectIsChatWithSelf(global, chat);

    return {
      message,
      ...(userId && { sender: selectUser(global, userId) }),
      ...(originUserId && { originSender: selectUser(global, originUserId) }),
      ...(replyMessage && {
        replyMessage,
        replyMessageSender,
      }),
      ...(message.is_outgoing && { outgoingStatus: selectOutgoingStatus(global, message) }),
      ...(typeof fileTransferProgress === 'number' && { fileTransferProgress }),
      isFocused,
      focusDirection,
      isChatWithSelf,
    };
  },
  (setGlobal, actions) => {
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
