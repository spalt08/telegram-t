import React, {
  FC, memo, useState, useRef, useCallback, useEffect,
} from '../../../lib/teact/teact';

import { ApiSticker, ApiVideo } from '../../../api/types';

import { IAllowedAttachmentOptions } from '../../../modules/helpers';
import { IS_SMOOTH_SCROLL_SUPPORTED, IS_TOUCH_ENV } from '../../../util/environment';

import Menu from '../../ui/Menu';
import Transition from '../../ui/Transition';
import EmojiPicker from './EmojiPicker';
import StickerPicker from './StickerPicker';
import GifPicker from './GifPicker';
import SymbolMenuFooter, { SymbolMenuTabs, SYMBOL_MENU_TAB_TITLES } from './SymbolMenuFooter';

import './SymbolMenu.scss';

const MENU_CLOSE_TIMEOUT = 250;
const TRANSITION_NAME = IS_SMOOTH_SCROLL_SUPPORTED ? 'scroll-slide' : 'slide';

let closeTimeout: number | undefined;

export type OwnProps = {
  isOpen: boolean;
  allowedAttachmentOptions: IAllowedAttachmentOptions;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  onStickerSelect: (sticker: ApiSticker) => void;
  onGifSelect: (gif: ApiVideo) => void;
  onRemoveSymbol: () => void;
  onSearchOpen: (type: 'stickers' | 'gifs') => void;
};

const SymbolMenu: FC<OwnProps> = ({
  isOpen, allowedAttachmentOptions,
  onClose, onEmojiSelect, onStickerSelect, onGifSelect, onRemoveSymbol, onSearchOpen,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const isActivated = useRef(false);
  const isMouseInside = useRef(false);

  if (!isActivated.current && isOpen) {
    isActivated.current = true;
  }

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
      <div className="SymbolMenu-main">
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
    </Menu>
  );
};

export default memo(SymbolMenu);
