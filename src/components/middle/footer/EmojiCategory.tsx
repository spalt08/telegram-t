import React, { FC, memo } from '../../../lib/teact/teact';

import useShowTransition from '../../../hooks/useShowTransition';
import buildClassName from '../../../util/buildClassName';

import EmojiButton from './EmojiButton';

interface IProps {
  category: EmojiCategory;
  allEmojis: AllEmojis;
  show: boolean;
  onEmojiSelect: (emoji: string, name: string) => void;
}

const EMOJI_ROW_SIZE = 9;
const EMOJI_SIZE = 44; // px

const EmojiCategory: FC<IProps> = ({
  category, allEmojis, show, onEmojiSelect,
}) => {
  const { length } = category.emojis;
  const { transitionClassNames } = useShowTransition(show);
  const categoryHeight = Math.ceil(length / EMOJI_ROW_SIZE) * EMOJI_SIZE;

  return (
    <div
      key={category.id}
      id={`emoji-category-${category.id}`}
      className="symbol-set"
    >
      <p className="symbol-set-name">{category.name}</p>
      <div
        className={buildClassName('symbol-set-container overlay', transitionClassNames)}
        // @ts-ignore teact feature
        style={`height: ${categoryHeight}px`}
      >
        {category.emojis.map((name, index) => {
          const emoji = allEmojis[name];
          // Some emojis have multiple skins and are represented as an Object with emojis for all skins.
          // For now, we select only the first emoji with 'neutral' skin.
          const displayedEmoji = 'id' in emoji ? emoji : emoji[1];

          return (
            <EmojiButton
              key={displayedEmoji.id}
              emoji={displayedEmoji}
              top={Math.floor(index / EMOJI_ROW_SIZE) * EMOJI_SIZE}
              left={(index % EMOJI_ROW_SIZE) * EMOJI_SIZE}
              onEmojiSelect={onEmojiSelect}
            />
          );
        })}
      </div>
    </div>
  );
};

export default memo(EmojiCategory);
