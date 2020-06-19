import React, {
  FC, memo, useState, useRef, useCallback, useEffect, useLayoutEffect,
} from '../../../lib/teact/teact';

import { ApiSticker, ApiVideo } from '../../../api/types';

import { IAllowedAttachmentOptions } from '../../../modules/helpers';
import { IS_SMOOTH_SCROLL_SUPPORTED, IS_TOUCH_ENV, IS_MOBILE_SCREEN } from '../../../util/environment';
import useShowTransition from '../../../hooks/useShowTransition';
import buildClassName from '../../../util/buildClassName';
import { fastRaf } from '../../../util/schedulers';

import Menu from '../../ui/Menu';
import Transition from '../../ui/Transition';
import EmojiPicker from './EmojiPicker';
import StickerPicker from './StickerPicker';
import GifPicker from './GifPicker';
import SymbolMenuFooter, { SymbolMenuTabs, SYMBOL_MENU_TAB_TITLES } from './SymbolMenuFooter';
import Portal from '../../ui/Portal';

import './SymbolMenu.scss';

const MENU_CLOSE_TIMEOUT = 250;
const SYMBOL_MENU_CLOSE_TIMEOUT = 350;
const TRANSITION_NAME = IS_SMOOTH_SCROLL_SUPPORTED ? 'scroll-slide' : 'slide';

let closeTimeout: number | undefined;

export type OwnProps = {
  isOpen: boolean;
  allowedAttachmentOptions: IAllowedAttachmentOptions;
  onLoad: () => void;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  onStickerSelect: (sticker: ApiSticker) => void;
  onGifSelect: (gif: ApiVideo) => void;
  onRemoveSymbol: () => void;
  onSearchOpen: (type: 'stickers' | 'gifs') => void;
};

const SymbolMenu: FC<OwnProps> = ({
  isOpen, allowedAttachmentOptions,
  onLoad, onClose,
  onEmojiSelect, onStickerSelect, onGifSelect,
  onRemoveSymbol, onSearchOpen,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const isActivated = useRef(false);
  const isMouseInside = useRef(false);

  const { shouldRender, transitionClassNames } = useShowTransition(isOpen, onClose, false, false);

  if (!isActivated.current && isOpen) {
    isActivated.current = true;
  }

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  useEffect(() => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = undefined;
    }
    if (isOpen && !IS_TOUCH_ENV) {
      closeTimeout = window.setTimeout(() => {
        if (!isMouseInside.current) {
          onClose();
        }
      }, MENU_CLOSE_TIMEOUT * 2);
    }
  }, [isOpen, onClose]);

  useLayoutEffect(() => {
    if (!IS_MOBILE_SCREEN) {
      return;
    }

    if (isOpen) {
      document.body.classList.add('enable-symbol-menu-transforms');
      document.body.classList.add('is-symbol-menu-open');
    } else {
      fastRaf(() => {
        document.body.classList.remove('is-symbol-menu-open');
        setTimeout(() => {
          document.body.classList.remove('enable-symbol-menu-transforms');
        }, SYMBOL_MENU_CLOSE_TIMEOUT);
      });
    }
  }, [isOpen]);

  const handleMouseEnter = useCallback(() => {
    isMouseInside.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isMouseInside.current = false;
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = undefined;
    }
    closeTimeout = window.setTimeout(() => {
      if (!isMouseInside.current) {
        onClose();
      }
    }, MENU_CLOSE_TIMEOUT);
  }, [onClose]);

  const { canSendStickers, canSendGifs } = allowedAttachmentOptions;

  function renderContent() {
    switch (activeTab) {
      case SymbolMenuTabs.Emoji:
        return (
          <EmojiPicker
            className="picker-tab"
            onEmojiSelect={onEmojiSelect}
          />
        );
      case SymbolMenuTabs.Stickers:
        return (
          <StickerPicker
            className="picker-tab"
            load={canSendStickers ? isOpen : false}
            canSendStickers={canSendStickers}
            onStickerSelect={onStickerSelect}
          />
        );
      case SymbolMenuTabs.GIFs:
        return (
          <GifPicker
            className="picker-tab"
            load={canSendGifs ? isOpen : false}
            canSendGifs={canSendGifs}
            onGifSelect={onGifSelect}
          />
        );
    }

    return undefined;
  }

  function stopPropagation(event: any) {
    event.stopPropagation();
  }

  const content = (
    <>
      <div className="SymbolMenu-main" onClick={stopPropagation}>
        {isActivated.current && (
          <Transition name={TRANSITION_NAME} activeKey={activeTab} renderCount={SYMBOL_MENU_TAB_TITLES.length}>
            {renderContent}
          </Transition>
        )}
      </div>
      <SymbolMenuFooter
        activeTab={activeTab}
        onSwitchTab={setActiveTab}
        onRemoveSymbol={onRemoveSymbol}
        onSearchOpen={onSearchOpen}
      />
    </>
  );

  if (IS_MOBILE_SCREEN) {
    if (!shouldRender) {
      return undefined;
    }

    const className = buildClassName(
      'SymbolMenu mobile-menu',
      transitionClassNames,
    );

    return (
      <Portal>
        <div className={className}>
          {content}
        </div>
      </Portal>
    );
  }

  return (
    <Menu
      isOpen={isOpen}
      positionX="left"
      positionY="bottom"
      onClose={onClose}
      className="SymbolMenu"
      onCloseAnimationEnd={onClose}
      onMouseEnter={!IS_TOUCH_ENV ? handleMouseEnter : undefined}
      onMouseLeave={!IS_TOUCH_ENV ? handleMouseLeave : undefined}
      noCloseOnBackdrop={!IS_TOUCH_ENV}
    >
      {content}
    </Menu>
  );
};

export default memo(SymbolMenu);
