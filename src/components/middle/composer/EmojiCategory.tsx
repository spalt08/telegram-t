import React, { FC, memo } from '../../../lib/teact/teact';
import EmojiButton from './EmojiButton';

interface IProps {
  category: EmojiCategory;
  allEmojis: AllEmojis;
  onEmojiSelect: (emoji: string, name: string) => void;
}

const EmojiCategory: FC<IProps> = ({
  category, allEmojis, onEmojiSelect,
}) => {
  return (
    <div
      key={category.id}
      id={`emoji-category-${category.id}`}
      className="symbol-set"
    >
      <p className="symbol-set-name">{category.name}</p>
      <div className="symbol-set-container">
        {category.emojis.map((name) => {
          const emoji = allEmojis[name];
          // Some emojis have multiple skins and are represented as an Object with emojis for all skins.
          // For now, we select only the first emoji with 'neutral' skin.
          const displayedEmoji = 'id' in emoji ? emoji : emoji[1];

          return (
            <EmojiButton
              key={displayedEmoji.id}
              emoji={displayedEmoji}
              onClick={onEmojiSelect}
            />
          );
        })}
      </div>
    </div>
  );
};

export default memo(EmojiCategory);
