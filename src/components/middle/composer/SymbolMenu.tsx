import React, {
  FC, memo, useState, useRef, useCallback, useEffect,
} from '../../../lib/teact/teact';

import { ApiSticker, ApiVideo } from '../../../api/types';

import Menu from '../../ui/Menu';
import TabList from '../../ui/TabList';
import EmojiPicker from './EmojiPicker';
import StickerPicker from './StickerPicker';
import GifPicker from './GifPicker';

import './SymbolMenu.scss';

const TABS = [
  'Emoji',
  'Stickers',
  'GIFs',
];

const CONTENT = [
  'emoji',
  'sticker',
  'gif',
];

const MENU_CLOSE_TIMEOUT = 250;
let closeTimeout: NodeJS.Timeout | null = null;

type IProps = {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  onStickerSelect: (sticker: ApiSticker) => void;
  onGifSelect: (gif: ApiVideo) => void;
};

const SymbolMenu: FC<IProps> = ({
  isOpen, onClose, onEmojiSelect, onStickerSelect, onGifSelect,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const selectedScreen = CONTENT[activeTab];
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
      noCloseOnBackdrop
    >
      <TabList activeTab={activeTab} tabs={TABS} onSwitchTab={setActiveTab} />
      <div className="SymbolMenu-main">
        {isActivated.current && (
          <>
            <EmojiPicker
              className={`picker-tab ${isOpen && selectedScreen === 'emoji' ? 'active' : ''}`}
              onEmojiSelect={onEmojiSelect}
            />
            <StickerPicker
              className={`picker-tab ${isOpen && selectedScreen === 'sticker' ? 'active' : ''}`}
              load={isOpen && selectedScreen === 'sticker'}
              onStickerSelect={onStickerSelect}
            />
            <GifPicker
              className={`picker-tab ${isOpen && selectedScreen === 'gif' ? 'active' : ''}`}
              load={isOpen && selectedScreen === 'gif'}
              onGifSelect={onGifSelect}
            />
          </>
        )}
      </div>
    </Menu>
  );
};

export default memo(SymbolMenu);