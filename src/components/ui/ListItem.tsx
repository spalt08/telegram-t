import React, {
  FC, useState, useRef, useCallback, useEffect,
} from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';

import RippleEffect from './RippleEffect';
import AttentionIndicator from './AttentionIndicator';
import Menu from './Menu';
import MenuItem from './MenuItem';

import './ListItem.scss';

type OnClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;

type IAnchorPosition = {
  x: number;
  y: number;
};

type MenuItemContextAction = {
  title: string;
  icon: string;
  handler: () => void;
};

type OwnProps = {
  icon?: string;
  className?: string;
  children: any;
  onClick?: OnClickHandler;
  disabled?: boolean;
  attention?: boolean;
  ripple?: boolean;
  narrow?: boolean;
  inactive?: boolean;
  contextAction?: MenuItemContextAction;
};

const ListItem: FC<OwnProps> = (props) => {
  const {
    icon,
    className,
    children,
    onClick,
    disabled,
    attention,
    ripple,
    narrow,
    inactive,
    contextAction,
  } = props;

  const containerRef = useRef<HTMLDivElement>();
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<IAnchorPosition | undefined>(undefined);

  const [positionX, setPositionX] = useState<'right' | 'left'>('left');
  const [positionY, setPositionY] = useState<'top' | 'bottom'>('top');
  const [style, setStyle] = useState('');

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (disabled || !onClick) {
      return;
    }
    onClick(e);
  }, [disabled, onClick]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if (contextMenuPosition) {
      return;
    }

    setIsContextMenuOpen(true);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  }, [contextMenuPosition]);

  useEffect(() => {
    if (!contextMenuPosition) {
      return;
    }

    const emptyRect = {
      width: 0, left: 0, height: 0, top: 0,
    };
    let { x, y } = contextMenuPosition;

    const container = containerRef.current!;
    const containerRect = container.getBoundingClientRect();
    const menuEl = container.querySelector<HTMLDivElement>('.ListItem-context-menu .bubble');
    const menuRect = menuEl ? { width: menuEl.offsetWidth, height: menuEl.offsetHeight } : emptyRect;

    if (x + menuRect.width < containerRect.width + containerRect.left) {
      setPositionX('left');
      x += 3;
    } else if (x - menuRect.width > 0) {
      setPositionX('right');
      x -= 3;
    } else {
      setPositionX('left');
      x = 16;
    }

    if (y + menuRect.height < containerRect.height + containerRect.top) {
      setPositionY('top');
    } else {
      setPositionY('bottom');

      if (y - menuRect.height < containerRect.top) {
        y = containerRect.top + menuRect.height;
      }
    }

    setStyle(`left: ${x - containerRect.left}px; top: ${y - containerRect.top}px;`);
  }, [contextMenuPosition]);

  const handleContextMenuClose = useCallback(() => {
    setIsContextMenuOpen(false);
  }, []);

  const handleContextMenuHide = useCallback(() => {
    setContextMenuPosition(undefined);
  }, []);

  const fullClassName = buildClassName(
    'ListItem',
    className,
    ripple && 'has-ripple',
    narrow && 'narrow',
    inactive && 'inactive',
    contextMenuPosition && 'has-menu-open',
  );

  return (
    <div
      ref={containerRef}
      className={fullClassName}
    >
      <button
        type="button"
        onClick={!inactive ? handleClick : undefined}
        disabled={disabled}
        onMouseDown={!inactive && contextAction ? handleMouseDown : undefined}
        onContextMenu={!inactive && contextAction ? handleMouseDown : undefined}
      >
        {icon && (
          <i className={`icon-${icon}`} />
        )}
        {children}
        {!disabled && !inactive && ripple && (
          <RippleEffect />
        )}
        {attention && <AttentionIndicator show={attention} />}
      </button>
      {contextAction && contextMenuPosition !== undefined && (
        <Menu
          isOpen={isContextMenuOpen}
          positionX={positionX}
          positionY={positionY}
          style={style}
          className="ListItem-context-menu"
          autoClose
          onClose={handleContextMenuClose}
          onCloseAnimationEnd={handleContextMenuHide}
        >
          <MenuItem icon={contextAction.icon} onClick={contextAction.handler}>
            {contextAction.title}
          </MenuItem>
        </Menu>
      )}
    </div>
  );
};

export default ListItem;
