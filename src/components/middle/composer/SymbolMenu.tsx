import React, {
  FC, memo, useState, useRef, useCallback, useEffect,
} from '../../../lib/teact/teact';

import { ApiSticker, ApiVideo } from '../../../api/types';

import Menu from '../../ui/Menu';
import TabList from '../../ui/TabList';
import Transition from '../../ui/Transition';
import EmojiPicker from './EmojiPicker';
import StickerPicker from './StickerPicker';
import GifPicker from './GifPicker';

import './SymbolMenu.scss';

enum Tabs {
  'Emoji',
  'Stickers',
  'GIFs',
}

// Getting enum string values for display in Tabs.
// See: https://www.typescriptlang.org/docs/handbook/enums.html#reverse-mappings
const TAB_TITLES = Object.values(Tabs).filter((value): value is string => typeof value === 'string');
const MENU_CLOSE_TIMEOUT = 250;
const TRANSITION_NAME = navigator.userAgent.includes('Safari') ? 'slide' : 'scroll-slide';

let closeTimeout: NodeJS.Timeout | null = null;

type OwnProps = {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  onStickerSelect: (sticker: ApiSticker) => void;
  onGifSelect: (gif: ApiVideo) => void;
};

const SymbolMenu: FC<OwnProps> = ({
  isOpen, onClose, onEmojiSelect, onStickerSelect, onGifSelect,
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
    }
    if (isOpen) {
      closeTimeout = setTimeout(() => {
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
    }
    closeTimeout = setTimeout(() => {
      if (!isMouseInside.current) {
        onClose();
      }
    }, MENU_CLOSE_TIMEOUT);
  }, [onClose]);

  function renderContent() {
    switch (activeTab) {
      case Tabs.Emoji:
        return (
          <EmojiPicker
            className="picker-tab"
            onEmojiSelect={onEmojiSelect}
          />
        );
      case Tabs.Stickers:
        return (
          <StickerPicker
            className="picker-tab"
            load={isOpen}
            onStickerSelect={onStickerSelect}
          />
        );
      case Tabs.GIFs:
        return (
          <GifPicker
            className="picker-tab"
            load={isOpen}
            onGifSelect={onGifSelect}
          />
        );
    }

    return null;
  }

  return (
    <Menu
      isOpen={isOpen}
      positionX="left"
      positionY="bottom"
      onClose={onClose}
      className="SymbolMenu"
      onCloseAnimationEnd={onClose}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <TabList activeTab={activeTab} tabs={TAB_TITLES} onSwitchTab={setActiveTab} />
      <div className="SymbolMenu-main">
        {isActivated.current && (
          <Transition name={TRANSITION_NAME} activeKey={activeTab} renderCount={TAB_TITLES.length}>
            {renderContent}
          </Transition>
        )}
      </div>
    </Menu>
  );
};

export default memo(SymbolMenu);
