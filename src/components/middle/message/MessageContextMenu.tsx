import React, { FC, useCallback } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';
import { IAnchorPosition } from '../../../types';

import { getMessageCopyOptions } from './helpers/copyOptions';
import useContextMenuPosition from '../../../hooks/useContextMenuPosition';

import Menu from '../../ui/Menu';
import MenuItem from '../../ui/MenuItem';

import './MessageContextMenu.scss';

type OwnProps = {
  isOpen: boolean;
  anchor: IAnchorPosition;
  message: ApiMessage;
  canReply?: boolean;
  canPin?: boolean;
  canDelete?: boolean;
  canEdit?: boolean;
  canForward?: boolean;
  canFaveSticker?: boolean;
  canUnfaveSticker?: boolean;
  onReply: () => void;
  onEdit: () => void;
  onPin: () => void;
  onForward: () => void;
  onDelete: () => void;
  onFaveSticker: () => void;
  onUnfaveSticker: () => void;
  onClose: () => void;
  onCloseAnimationEnd?: () => void;
};

const SCROLLBAR_WIDTH = 10;

const MessageContextMenu: FC<OwnProps> = ({
  isOpen,
  message,
  anchor,
  canReply,
  canEdit,
  canPin,
  canDelete,
  canForward,
  canFaveSticker,
  canUnfaveSticker,
  onReply,
  onEdit,
  onPin,
  onForward,
  onDelete,
  onFaveSticker,
  onUnfaveSticker,
  onClose,
  onCloseAnimationEnd,
}) => {
  const copyOptions = getMessageCopyOptions(message, onClose);

  const getTriggerElement = useCallback(() => {
    return document.querySelector(`div[data-message-id="${message.id}"]`);
  }, [message.id]);

  const getRootElement = useCallback(
    () => document.querySelector('.MessageList'),
    [],
  );

  const getMenuElement = useCallback(
    () => document.querySelector('.MessageContextMenu .bubble'),
    [],
  );

  const { positionX, positionY, style } = useContextMenuPosition(
    anchor,
    getTriggerElement,
    getRootElement,
    getMenuElement,
    SCROLLBAR_WIDTH,
    (document.querySelector('.MiddleHeader') as HTMLElement).offsetHeight,
  );

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
      {canReply && <MenuItem icon="reply" onClick={onReply}>Reply</MenuItem>}
      {canEdit && <MenuItem icon="edit" onClick={onEdit}>Edit</MenuItem>}
      {canFaveSticker && <MenuItem icon="favorite" onClick={onFaveSticker}>Add to Favorites</MenuItem>}
      {canUnfaveSticker && <MenuItem icon="favorite" onClick={onUnfaveSticker}>Remove from Favorites</MenuItem>}
      {copyOptions.map((options) => (
        <MenuItem key={options.label} icon="copy" onClick={options.handler}>{options.label}</MenuItem>
      ))}
      {canPin && <MenuItem icon="pin" onClick={onPin}>Pin</MenuItem>}
      {canForward && <MenuItem icon="forward" onClick={onForward}>Forward</MenuItem>}
      {canDelete && <MenuItem destructive icon="delete" onClick={onDelete}>Delete</MenuItem>}
    </Menu>
  );
};

export default MessageContextMenu;
