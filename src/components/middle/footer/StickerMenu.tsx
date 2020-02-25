import React, {
  FC, memo, useState, useRef, useCallback, useEffect,
} from '../../../lib/teact/teact';

import { ApiSticker } from '../../../api/types';

import Menu from '../../ui/Menu';
import TabList from '../../ui/TabList';
import EmojiPicker from './EmojiPicker';
import StickerPicker from './StickerPicker';

import './StickerMenu.scss';

const TABS = [
  'Emoji',
  'Stickers',
  '-GIFs',
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
};

const StickerMenu: FC<IProps> = ({
  isOpen, onClose, onEmojiSelect, onStickerSelect,
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
      className="StickerMenu"
      onCloseAnimationEnd={onClose}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      noCloseOnBackdrop
    >
      <TabList activeTab={activeTab} tabs={TABS} onSwitchTab={setActiveTab} />
      <div className="StickerMenu-main">
        {isActivated.current && (
          <>
            <EmojiPicker
              className={`picker-tab ${selectedScreen === 'emoji' ? 'active' : ''}`}
              onEmojiSelect={onEmojiSelect}
            />
            <StickerPicker
              className={`picker-tab ${selectedScreen === 'sticker' ? 'active' : ''}`}
              onStickerSelect={onStickerSelect}
            />
            <div className={`picker-tab ${selectedScreen === 'gif' ? 'active' : ''}`} />
          </>
        )}
      </div>
    </Menu>
  );
};

export default memo(StickerMenu);
