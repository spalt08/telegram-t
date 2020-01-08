import React, {
  FC, useCallback, useEffect, useState,
} from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { ApiMessage } from '../../../../api/types';
import { GlobalActions } from '../../../../store/types';

import { selectChat, selectChatMessage, selectIsChatWithSelf } from '../../../../modules/selectors';
import { isPrivateChat } from '../../../../modules/helpers';
import { getMessageCopyOptions } from '../middle/message/clipboard';

import MenuItem from '../../../../components/ui/MenuItem';
import Menu from '../../../../components/ui/Menu';

import './MessageContextMenu.scss';

type IAnchorPosition = {
  x: number;
  y: number;
};

type IProps = {
  isOpen: boolean;
  anchor: IAnchorPosition;
  messageId: number;
  message: ApiMessage;
  onClose: (e: React.MouseEvent<any, MouseEvent>) => void;
  canPin?: boolean;
  canDelete?: boolean;
} & Pick<GlobalActions, 'setChatReplyingTo' | 'pinMessage' | 'deleteMessages'>;

const SCROLLBAR_WIDTH = 10;

const MessageContextMenu: FC<IProps> = ({
  isOpen,
  messageId,
  anchor,
  message,
  onClose,
  canPin,
  canDelete,
  setChatReplyingTo,
  pinMessage,
  deleteMessages,
}) => {
  const [isShown, setIsShown] = useState(false);
  const [positionX, setPositionX] = useState('right');
  const [positionY, setPositionY] = useState('bottom');
  const [style, setStyle] = useState('');
  const copyOptions = getMessageCopyOptions(message);

  useEffect(() => {
    let { x, y } = anchor;
    const messageEl = document.querySelector(`div[data-message-id="${messageId}"]`);

    if (messageEl) {
      const emptyRect = {
        width: 0, left: 0, height: 0, top: 0,
      };
      const menuEl = document.querySelector('.MessageContextMenu .bubble');
      const rootEl = document.querySelector('.MessageList');
      const headerHeight = (document.querySelector('.MiddleHeader') as HTMLElement).offsetHeight;
      const rootRect = rootEl ? rootEl.getBoundingClientRect() : emptyRect;
      const menuRect = menuEl ? menuEl.getBoundingClientRect() : emptyRect;
      const messageRect = messageEl.getBoundingClientRect();

      if (x + menuRect.width + SCROLLBAR_WIDTH < rootRect.width + rootRect.left) {
        setPositionX('left');
      }
      if (y + menuRect.height + SCROLLBAR_WIDTH < rootRect.height + rootRect.top) {
        setPositionY('top');
      } else if (y - menuRect.height < rootRect.top + headerHeight) {
        y = rootRect.top + headerHeight + menuRect.height;
      }

      x += positionX === 'left' ? 3 : -3;

      setStyle(`left: ${x - messageRect.left}px; top: ${y - messageRect.top}px;`);
      setIsShown(true);
    }
  }, [messageId, anchor, positionX]);

  const handleClose = (e: React.MouseEvent) => {
    // Prevent showing default context menu for custom context menu.
    e.preventDefault();
    onClose(e);
  };

  const handleReply = useCallback(() => {
    setChatReplyingTo({ chatId: message.chat_id, messageId });
  }, [setChatReplyingTo, message, messageId]);

  const handlePin = useCallback(() => {
    pinMessage({ chatId: message.chat_id, messageId });
  }, [pinMessage, message, messageId]);

  const handleDelete = useCallback(() => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure?')) {
      deleteMessages({ chatId: message.chat_id, messageIds: [messageId], shouldDeleteForAll: false });
    }
  }, [deleteMessages, message, messageId]);

  return (
    <Menu
      isOpen={isOpen}
      isShown={isShown}
      positionX={positionX}
      positionY={positionY}
      style={style}
      className={`MessageContextMenu fluid${isOpen ? ' open' : ''}${isShown ? ' shown' : ''}`}
      onClose={handleClose}
    >
      <MenuItem icon="reply" onClick={handleReply}>Reply</MenuItem>
      {copyOptions.map((options) => (
        <MenuItem key={options.label} icon="copy" onClick={options.handler}>{options.label}</MenuItem>
      ))}
      {canPin && <MenuItem icon="pin" onClick={handlePin}>Pin</MenuItem>}
      <MenuItem className="not-implemented" icon="forward">Forward</MenuItem>
      {canDelete && <MenuItem className="danger" icon="delete" onClick={handleDelete}>Delete</MenuItem>}
    </Menu>
  );
};

export default withGlobal(
  (global, { messageId }) => {
    const { chats: { selectedId: chatId } } = global;

    const message = selectChatMessage(global, chatId as number, messageId);
    const chat = selectChat(global, chatId as number);
    const canPin = selectIsChatWithSelf(global, chat); // TODO || isGroupChatAdmin(chat)
    const canDelete = isPrivateChat(chat.id); // TODO || isGroupChatAdmin(chat) || selectIsSelfMessage(global, message)

    return {
      message,
      canPin,
      canDelete,
    };
  },
  (_, actions) => {
    const { setChatReplyingTo, pinMessage, deleteMessages } = actions;
    return { setChatReplyingTo, pinMessage, deleteMessages };
  },
)(MessageContextMenu);
