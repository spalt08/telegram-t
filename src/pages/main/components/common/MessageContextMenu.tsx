import React, { FC, useEffect, useState } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';
import { selectChatMessage } from '../../../../modules/selectors';
import { getMessageCopyOptions } from '../middle/message/clipboard';
import { ApiMessage } from '../../../../api/types';

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
};

const SCROLLBAR_WIDTH = 10;

const MessageContextMenu: FC<IProps> = ({
  isOpen, messageId, anchor, message, onClose,
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
      <MenuItem className="not-implemented" icon="reply">Reply</MenuItem>
      {copyOptions.map((options) => (
        <MenuItem key={options.label} icon="copy" onClick={options.handler}>{options.label}</MenuItem>
      ))}
      <MenuItem className="not-implemented" icon="pin">Pin</MenuItem>
      <MenuItem className="not-implemented" icon="forward">Forward</MenuItem>
      <MenuItem className="danger not-implemented" icon="delete">Delete</MenuItem>
    </Menu>
  );
};

export default withGlobal((global, { messageId }) => {
  const { chats: { selectedId: chatId } } = global;

  const message = selectChatMessage(global, chatId as number, messageId);

  return {
    message,
  };
})(MessageContextMenu);
