import React, {
  FC, memo, useState,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../store/types';
import { ApiMessage, ApiMessageOutgoingStatus, ApiUser } from '../../../api/types';

import {
  selectChatMessage,
  selectFileTransferProgress,
  selectOutgoingStatus,
  selectUser,
} from '../../../modules/selectors';
import {
  getMessageMediaHash,
  getUserFullName,
  isOwnMessage,
  isReplyMessage,
} from '../../../modules/helpers';
import { calculateInlineImageDimensions, calculateVideoDimensions } from '../../../util/mediaDimensions';
import { buildMessageContent } from './util/buildMessageContent';
import getMinMediaWidth from './util/minMediaWidth';
import useEnsureMessage from '../../../hooks/useEnsureMessage';
import useEnsureUserFromMessage from '../../../hooks/useEnsureUserFromMessage';

import Avatar from '../../common/Avatar';
import MessageMeta from './MessageMeta';
import ReplyMessage from '../../common/ReplyMessage';
import ContextMenuContainer from './ContextMenuContainer';

import Sticker from './Sticker';
import Document from './Document';
import Video from './Video';
import Photo from './Photo';
import Contact from './Contact';

import './Message.scss';

type MessagePositionProperties = {
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  isLastInList: boolean;
};

type IProps = {
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
} & MessagePositionProperties & Pick<GlobalActions, 'selectMediaMessage' | 'openUserInfo'>;

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
  selectMediaMessage,
  openUserInfo,
  isFirstInGroup,
  isLastInGroup,
  isLastInList,
}) => {
  const { chat_id: chatId, id: messageId } = message;

  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);

  useEnsureUserFromMessage(
    chatId,
    messageId,
    showAvatar || showSenderName ? message.sender_user_id : undefined,
    sender,
  );
  useEnsureUserFromMessage(
    chatId,
    messageId,
    message.forward_info && message.forward_info.origin.sender_user_id,
    originSender,
  );
  useEnsureMessage(chatId, message.reply_to_message_id, replyMessage);
  useEnsureUserFromMessage(
    chatId,
    messageId,
    replyMessage && replyMessage.sender_user_id,
    replyMessageSender,
  );

  const containerClassNames = buildClassNames(
    message,
    { isFirstInGroup, isLastInGroup, isLastInList },
    contextMenuPosition !== null,
  );

  const {
    text,
    photo,
    video,
    document,
    sticker,
    contact,
    className: contentClassName,
  } = buildMessageContent(message, { isLastInGroup, hasReply: Boolean(replyMessage) });
  const isText = Boolean(contentClassName && contentClassName.includes('text'));
  const isSticker = Boolean(contentClassName && contentClassName.includes('sticker'));
  const isForwarded = Boolean(message.forward_info);

  function openMediaMessage(): void {
    selectMediaMessage({ id: messageId });
  }

  function handleBeforeContextMenu(e: React.MouseEvent) {
    if (e.button === 2) {
      e.currentTarget.classList.add('no-selection');
    }
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.currentTarget.classList.remove('no-selection');

    if (contextMenuPosition) {
      return;
    }

    setIsContextMenuOpen(true);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  }

  function handleContextMenuClose() {
    setIsContextMenuOpen(false);
  }

  function handleContextMenuHide() {
    setContextMenuPosition(null);
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
    if (isForwarded && !sticker) {
      classNames.push('forwarded-message');
    }
    if (replyMessage) {
      classNames.push('reply-message');
    }

    return (
      <div className={classNames.join(' ')}>
        {renderSenderName(isForwarded ? originSender : sender)}
        {replyMessage && (
          <ReplyMessage message={replyMessage} sender={replyMessageSender} loadPictogram={loadAndPlayMedia} />
        )}
        {photo && (
          <Photo
            message={message}
            load={loadAndPlayMedia}
            fileTransferProgress={fileTransferProgress}
            onClick={openMediaMessage}
          />
        )}
        {video && (
          <Video
            message={message}
            loadAndPlay={loadAndPlayMedia}
            onClick={openMediaMessage}
          />
        )}
        {document && <Document document={document} />}
        {sticker && (
          <Sticker
            message={message}
            loadAndPlay={loadAndPlayMedia}
          />
        )}
        {text && (
          <p className="text-content">{text}</p>
        )}
        {contact && <Contact contact={contact} />}
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
      ? calculateInlineImageDimensions(photo, isOwnMessage(message), isForwarded)
      : (video && calculateVideoDimensions(video, isOwnMessage(message), isForwarded)) || {};

    if (width) {
      const calculatedWidth = Math.max(
        getMinMediaWidth(Boolean(text)),
        width,
      );

      style = `width: ${calculatedWidth}px`;
    }
  }

  return (
    <div className={containerClassNames.join(' ')} data-message-id={messageId}>
      {showAvatar && (
        <Avatar
          size="small"
          user={sender}
          onClick={viewUser}
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

  if (isOwnMessage(message)) {
    classNames.push('own');
  } else {
    classNames.push('not-own');
  }

  if (getMessageMediaHash(message, 'inline')) {
    classNames.push('has-media');
  }

  if (isReplyMessage(message)) {
    classNames.push('has-reply');
  }

  if (hasContextMenu) {
    classNames.push('has-menu-open');
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

    let userId;
    let originUserId;
    if (showSenderName || showAvatar) {
      userId = message.sender_user_id;
    }
    if (message.forward_info) {
      originUserId = message.forward_info.origin.sender_user_id;
    }

    const fileTransferProgress = selectFileTransferProgress(global, message);

    return {
      message,
      ...(userId && { sender: selectUser(global, userId) }),
      ...(originUserId && { originSender: selectUser(global, originUserId) }),
      ...(replyMessage && {
        replyMessage,
        replyMessageSender: selectUser(global, replyMessage.sender_user_id),
      }),
      ...(message.is_outgoing && { outgoingStatus: selectOutgoingStatus(global, message) }),
      ...(typeof fileTransferProgress === 'number' && { fileTransferProgress }),
    };
  },
  (setGlobal, actions) => {
    const {
      selectMediaMessage,
      openUserInfo,
    } = actions;
    return {
      selectMediaMessage,
      openUserInfo,
    };
  },
)(Message));
