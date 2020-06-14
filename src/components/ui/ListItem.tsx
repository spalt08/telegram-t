import { RefObject } from 'react';
import React, { FC, useRef, useCallback } from '../../lib/teact/teact';

import { IS_TOUCH_ENV } from '../../util/environment';
import buildClassName from '../../util/buildClassName';
import useContextMenuHandlers from '../../hooks/useContextMenuHandlers';
import useContextMenuPosition from '../../hooks/useContextMenuPosition';

import RippleEffect from './RippleEffect';
import AttentionIndicator from './AttentionIndicator';
import Menu from './Menu';
import MenuItem from './MenuItem';

import './ListItem.scss';

type OnClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;

type MenuItemContextAction = {
  title: string;
  icon: string;
  destructive?: boolean;
  handler?: () => void;
};

type OwnProps = {
  ref?: RefObject<HTMLDivElement>;
  icon?: string;
  className?: string;
  children: any;
  disabled?: boolean;
  attention?: boolean;
  ripple?: boolean;
  narrow?: boolean;
  inactive?: boolean;
  contextActions?: MenuItemContextAction[];
  shouldDelayRipple?: boolean;
  onClick?: OnClickHandler;
  onMouseDown?: OnClickHandler;
};

const ListItem: FC<OwnProps> = (props) => {
  const {
    ref,
    icon,
    className,
    children,
    disabled,
    attention,
    ripple,
    narrow,
    inactive,
    contextActions,
    shouldDelayRipple,
    onClick,
  } = props;

  let containerRef = useRef<HTMLDivElement>();
  if (ref) {
    containerRef = ref;
  }

  const {
    isContextMenuOpen, contextMenuPosition,
    handleBeforeContextMenu, handleContextMenu,
    handleContextMenuClose, handleContextMenuHide,
  } = useContextMenuHandlers(containerRef);

  const getTriggerElement = useCallback(() => containerRef.current, []);

  const getRootElement = useCallback(
    () => containerRef.current!.closest('.custom-scroll'),
    [],
  );

  const getMenuElement = useCallback(
    () => containerRef.current!.querySelector('.ListItem-context-menu .bubble'),
    [],
  );

  const { positionX, positionY, style } = useContextMenuPosition(
    contextMenuPosition,
    getTriggerElement,
    getRootElement,
    getMenuElement,
  );

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (disabled || !onClick) {
      return;
    }
    onClick(e);
  }, [disabled, onClick]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (inactive) {
      return;
    }
    if (contextActions) {
      handleBeforeContextMenu(e);
    }
    if (!IS_TOUCH_ENV && e.button === 0) {
      if (!onClick) {
        handleContextMenu(e);
      } else {
        handleClick(e);
      }
    }
  }, [inactive, contextActions, onClick, handleBeforeContextMenu, handleContextMenu, handleClick]);

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
        disabled={disabled}
        onClick={!inactive && IS_TOUCH_ENV ? handleClick : undefined}
        onMouseDown={handleMouseDown}
        onContextMenu={!inactive && contextActions ? handleContextMenu : undefined}
      >
        {icon && (
          <i className={`icon-${icon}`} />
        )}
        {children}
        {!disabled && !inactive && ripple && (
          <RippleEffect delayed={shouldDelayRipple} />
        )}
        {attention && <AttentionIndicator show={attention} />}
      </button>
      {contextActions && contextMenuPosition !== undefined && (
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
          {contextActions.map((action) => (
            <MenuItem
              key={action.title}
              icon={action.icon}
              destructive={action.destructive}
              disabled={!action.handler}
              onClick={action.handler}
            >
              {action.title}
            </MenuItem>
          ))}
        </Menu>
      )}
    </div>
  );
};

export default ListItem;
