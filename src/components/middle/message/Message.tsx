import React, {
  FC, memo, useCallback, useEffect, useRef, useState,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiMessage, ApiMessageOutgoingStatus, ApiUser } from '../../../api/types';

import {
  selectChat,
  selectChatFocusedMessageId,
  selectChatMessage,
  selectViewportIds,
  selectFileTransferProgress,
  selectIsChatWithSelf,
  selectOutgoingStatus,
  selectUser,
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
    isReplyInViewport?: boolean;
    originSender?: ApiUser;
    canDelete?: boolean;
    contactFirstName: string | null;
    outgoingStatus?: ApiMessageOutgoingStatus;
    fileTransferProgress?: number;
    isFocused?: boolean;
    isChatWithSelf?: boolean;
  }
  & MessagePositionProperties
  & Pick<GlobalActions, (
    'focusMessage' | 'openMediaViewer' | 'openUserInfo' | 'cancelSendingMessage' | 'readMessageContents'
  )>
);

const FOCUSING_MAX_DISTANCE = 2000;
const NBSP = '\u00A0';

const Message: FC<IProps> = ({
  message,
  showAvatar,
  showSenderName,
  loadAndPlayMedia,
  sender,
  replyMessage,
  replyMessageSender,
  isReplyInViewport,
  originSender,
  outgoingStatus,
  fileTransferProgress,
  isFocused,
  isChatWithSelf,
  isFirstInGroup,
  isLastInGroup,
  isLastInList,
  focusMessage,
  openMediaViewer,
  openUserInfo,
  cancelSendingMessage,
  readMessageContents,
}) => {
  const { chat_id: chatId, id: messageId } = message;

  const elementRef = useRef<HTMLDivElement>();

  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);

  useEnsureMessage(chatId, message.reply_to_message_id, replyMessage);

  useEffect(() => {
    const messagesContainer = window.document.getElementById('MessageList');
    if (isFocused && elementRef.current && messagesContainer) {
      fastSmoothScroll(messagesContainer, elementRef.current, 'center', FOCUSING_MAX_DISTANCE);
    }
  }, [isFocused, chatId, focusMessage]);

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
            className={isReplyInViewport ? '' : 'not-implemented '}
            message={replyMessage}
            sender={replyMessageSender}
            loadPictogram={loadAndPlayMedia}
            onClick={isReplyInViewport ? handleReplyClick : undefined}
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
          <Poll messageId={message.id} poll={poll} />
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
        // eslint-disable-next-line
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

    const replyMessage = message.reply_to_message_id
      ? selectChatMessage(global, message.chat_id, message.reply_to_message_id)
      : undefined;
    const replyMessageSender = replyMessage && replyMessage.sender_user_id
      ? selectUser(global, replyMessage.sender_user_id)
      : undefined;
    const viewportIds = selectViewportIds(global, message.chat_id);
    const isReplyInViewport = message.reply_to_message_id && viewportIds
      && viewportIds.includes(message.reply_to_message_id);

    let userId;
    let originUserId;
    if (showSenderName || showAvatar) {
      userId = message.sender_user_id;
    }
    if (message.forward_info) {
      originUserId = message.forward_info.origin.sender_user_id;
    }

    const fileTransferProgress = selectFileTransferProgress(global, message);
    const isFocused = message.id === selectChatFocusedMessageId(global, message.chat_id);

    const chat = selectChat(global, message.chat_id);
    const isChatWithSelf = chat && selectIsChatWithSelf(global, chat);

    return {
      message,
      ...(userId && { sender: selectUser(global, userId) }),
      ...(originUserId && { originSender: selectUser(global, originUserId) }),
      ...(replyMessage && {
        replyMessage,
        replyMessageSender,
        isReplyInViewport,
      }),
      ...(message.is_outgoing && { outgoingStatus: selectOutgoingStatus(global, message) }),
      ...(typeof fileTransferProgress === 'number' && { fileTransferProgress }),
      isFocused,
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
    } = actions;
    return {
      focusMessage,
      openMediaViewer,
      cancelSendingMessage,
      openUserInfo,
      readMessageContents,
    };
  },
)(Message));
