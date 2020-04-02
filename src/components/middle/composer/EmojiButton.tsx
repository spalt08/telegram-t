import React, {
  FC, memo, useCallback,
} from '../../../lib/teact/teact';

import './EmojiButton.scss';

type OwnProps = {
  emoji: Emoji;
  onClick: (emoji: string, name: string) => void;
};

const EmojiButton: FC<OwnProps> = ({ emoji, onClick }) => {
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
