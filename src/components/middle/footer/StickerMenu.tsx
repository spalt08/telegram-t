import React, {
  FC, memo, useState, useRef,
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
  'GIFs',
];

const CONTENT = [
  'emoji',
  'sticker',
  'gif',
];

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

  if (!isActivated.current && isOpen) {
    isActivated.current = true;
  }

  return (
    <Menu
      isOpen={isOpen}
      positionX="left"
      positionY="bottom"
      onClose={onClose}
      className="StickerMenu"
      onCloseAnimationEnd={onClose}
      onMouseLeave={onClose}
      noCloseOnBackdrop
    >
      <TabList activeTab={activeTab} tabs={TABS} onSwitchTab={setActiveTab} />
      <div className="StickerMenu-main">
        {isActivated.current && [
          <EmojiPicker
            className={`picker-tab ${selectedScreen === 'emoji' ? 'active' : ''}`}
            onEmojiSelect={onEmojiSelect}
          />,
          <StickerPicker
            className={`picker-tab ${selectedScreen === 'sticker' ? 'active' : ''}`}
            onStickerSelect={onStickerSelect}
          />,
          <div className={`picker-tab ${selectedScreen === 'sticker' ? 'active' : ''}`} />,
        ]}
      </div>
    </Menu>
  );
};

export default memo(StickerMenu);
