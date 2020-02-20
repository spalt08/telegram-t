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
  selectChatMessageViewportIds,
  selectFileTransferProgress,
  selectIsChatWithSelf,
  selectOutgoingStatus,
  selectUser,
} from '../../../modules/selectors';
import {
  getMessageMediaHash,
  getUserFullName,
  hasMessageLocalBlobUrl,
  isOwnMessage,
  isReplyMessage,
  isForwardedMessage,
} from '../../../modules/helpers';
import { calculateInlineImageDimensions, calculateVideoDimensions } from '../../../util/mediaDimensions';
import { buildMessageContent } from './util/buildMessageContent';
import { getMinMediaWidth } from './util/mediaDimensions';
import useEnsureMessage from '../../../hooks/useEnsureMessage';

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
    const messagesContainer = document.getElementById('MessageList');
    if (isFocused && elementRef.current && messagesContainer) {
      const offset = elementRef.current.offsetTop - messagesContainer.scrollTop;
      if (offset < -FOCUSING_MAX_DISTANCE) {
        messagesContainer.scrollTop += (offset + FOCUSING_MAX_DISTANCE);
      } else if (offset > FOCUSING_MAX_DISTANCE) {
        messagesContainer.scrollTop += (offset - FOCUSING_MAX_DISTANCE);
      }

      elementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isFocused, chatId, focusMessage]);

  const isOwn = isOwnMessage(message);
  const isReply = isReplyMessage(message);
  const isForwarded = isForwardedMessage(message);

  const containerClassNames = buildClassNames(
    message,
    { isFirstInGroup, isLastInGroup, isLastInList },
    contextMenuPosition !== null,
    isOwn,
    isFocused,
  );
  const {
    isEmojiOnly,
    text,
    photo,
    video,
    audio,
    voice,
    document: messageDocument,
    sticker,
    contact,
    poll,
    webPage,
    className: contentClassName,
  } = buildMessageContent(message, { isLastInGroup, hasReply: isReply });

  const isSticker = Boolean(contentClassName && contentClassName.includes('sticker'));

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
      || !user || photo || video || sticker || isEmojiOnly
    ) {
      return null;
    }

    return (
      <div className="sender-name">{user ? getUserFullName(user) : NBSP}</div>
    );
  }

  function renderContent() {
    const classNames = ['content-inner'];
    if (isForwarded && !sticker) {
      classNames.push('forwarded-message');
    }
    if (isReply) {
      classNames.push('reply-message');
    }

    return (
      <div className={classNames.join(' ')}>
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
        {messageDocument && (
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
        {text && <p className="text-content">{text}</p>}
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
      className={containerClassNames.join(' ')}
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
        {message.forward_info && !isSticker && (
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

function buildClassNames(
  message: ApiMessage,
  position: MessagePositionProperties,
  hasContextMenu = false,
  isOwn = false,
  isFocused = false,
) {
  const classNames = ['Message'];

  if (position.isFirstInGroup) {
    classNames.push('first-in-group');
  }
  if (position.isLastInGroup) {
    classNames.push('last-in-group');
  }
  if (position.isLastInList) {
    classNames.push('last-in-list');
  }

  if (isOwn) {
    classNames.push('own');
  } else {
    classNames.push('not-own');
  }

  if (message.views) {
    classNames.push('has-views');
  }

  if (message.isEdited) {
    classNames.push('was-edited');
  }

  if (getMessageMediaHash(message, 'inline') || hasMessageLocalBlobUrl(message)) {
    classNames.push('has-media');
  }

  if (isReplyMessage(message)) {
    classNames.push('has-reply');
  }

  if (hasContextMenu) {
    classNames.push('has-menu-open');
  }

  if (isFocused) {
    classNames.push('focused');
  }

  if (message.is_deleting) {
    classNames.push('is-deleting');
  }

  return classNames;
}

export default memo(withGlobal(
  (global, ownProps: IProps) => {
    const { message, showSenderName, showAvatar } = ownProps;

    const replyMessage = message.reply_to_message_id
      ? selectChatMessage(global, message.chat_id, message.reply_to_message_id)
      : undefined;
    const replyMessageSender = replyMessage && replyMessage.sender_user_id
      ? selectUser(global, replyMessage.sender_user_id)
      : undefined;
    const viewportIds = selectChatMessageViewportIds(global, message.chat_id);
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
