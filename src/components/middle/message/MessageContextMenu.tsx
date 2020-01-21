import React, {
  FC, useEffect, useState,
} from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';

import { getMessageCopyOptions } from './util/clipboard';

import Menu from '../../ui/Menu';
import MenuItem from '../../ui/MenuItem';

import './MessageContextMenu.scss';

type IAnchorPosition = {
  x: number;
  y: number;
};

type IProps = {
  isOpen: boolean;
  anchor: IAnchorPosition;
  message: ApiMessage;
  canPin?: boolean;
  canDelete?: boolean;
  onReply: () => void;
  onPin: () => void;
  onDelete: () => void;
  onClose: () => void;
  onCloseAnimationEnd?: () => void;
};

const SCROLLBAR_WIDTH = 10;

const MessageContextMenu: FC<IProps> = ({
  isOpen,
  message,
  anchor,
  canPin,
  canDelete,
  onReply,
  onPin,
  onDelete,
  onClose,
  onCloseAnimationEnd,
}) => {
  const [positionX, setPositionX] = useState('right');
  const [positionY, setPositionY] = useState('bottom');
  const [style, setStyle] = useState('');
  const copyOptions = getMessageCopyOptions(message, onClose);

  useEffect(() => {
    let { x, y } = anchor;
    const messageEl = document.querySelector(`div[data-message-id="${message.id}"]`);

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
    }
  }, [message, anchor, positionX]);

  return (
    <Menu
      isOpen={isOpen}
      positionX={positionX}
      positionY={positionY}
      style={style}
      className="MessageContextMenu fluid"
      onClose={onClose}
      onCloseAnimationEnd={onCloseAnimationEnd}
    >
      <MenuItem icon="reply" onClick={onReply}>Reply</MenuItem>
      {copyOptions.map((options) => (
        <MenuItem key={options.label} icon="copy" onClick={options.handler}>{options.label}</MenuItem>
      ))}
      {canPin && <MenuItem icon="pin" onClick={onPin}>Pin</MenuItem>}
      <MenuItem className="not-implemented" icon="forward">Forward</MenuItem>
      {canDelete && <MenuItem className="danger" icon="delete" onClick={onDelete}>Delete</MenuItem>}
    </Menu>
  );
};

export default MessageContextMenu;