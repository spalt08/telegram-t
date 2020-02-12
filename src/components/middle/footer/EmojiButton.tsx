import React, {
  FC, memo, useCallback,
} from '../../../lib/teact/teact';

import './EmojiButton.scss';

interface IProps {
  emoji: Emoji;
  top: number;
  left: number;
  onEmojiSelect: (emoji: string, name: string) => void;
}

// TODO: Support selecting Emoji skin, store preferred skin in GlobalState
const EmojiButton: FC<IProps> = ({
  emoji, top, left, onEmojiSelect,
}) => {
  const handleSelectEmoji = useCallback(() => {
    onEmojiSelect(emoji.native, emoji.id);
  }, [emoji, onEmojiSelect]);

  return (
    <button
      className="EmojiButton"
      onClick={handleSelectEmoji}
      type="button"
      title={emoji.colons}
      // @ts-ignore teact feature
      style={`top: ${top}px; left: ${left}px`}
    >
      {emoji.native}
    </button>
  );
};

export default memo(EmojiButton);
