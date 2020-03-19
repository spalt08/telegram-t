import React, {
  FC, memo, useCallback,
} from '../../../lib/teact/teact';

import './EmojiButton.scss';

interface IProps {
  emoji: Emoji;
  onClick: (emoji: string, name: string) => void;
}

const EmojiButton: FC<IProps> = ({ emoji, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(emoji.native, emoji.id);
  }, [emoji, onClick]);

  return (
    <div
      className="EmojiButton"
      onClick={handleClick}
      title={emoji.colons}
    >
      {emoji.native}
    </div>
  );
};

export default memo(EmojiButton);
