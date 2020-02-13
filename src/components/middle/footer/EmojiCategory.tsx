import React, {
  FC, memo, useEffect, useState,
} from '../../../lib/teact/teact';

import useShowTransition from '../../../hooks/useShowTransition';

import EmojiButton from './EmojiButton';

type EmojiData = typeof import('../../../../public/emojiData.json');
type NimbleEmojiIndex = typeof import('emoji-mart/dist-es/utils/emoji-index/nimble-emoji-index');
let emojiIndexPromise: Promise<NimbleEmojiIndex>;
let EmojiIndex: NimbleEmojiIndex['default'];

async function ensureEmojiIndex() {
  if (!emojiIndexPromise) {
    // eslint-disable-next-line max-len
    emojiIndexPromise = import('emoji-mart/dist-es/utils/emoji-index/nimble-emoji-index') as unknown as Promise<NimbleEmojiIndex>;
    EmojiIndex = (await emojiIndexPromise).default;
  }

  return emojiIndexPromise;
}

interface IProps {
  data: EmojiData;
  category: EmojiCategory;
  onEmojiSelect: (emoji: string, name: string) => void;
}

const EMOJI_ROW_SIZE = 9;
const EMOJI_SIZE = 44; // px

const EmojiCategory: FC<IProps> = ({ data, category, onEmojiSelect }) => {
  const categoryHeight = Math.ceil(category.emojis.length / EMOJI_ROW_SIZE) * EMOJI_SIZE;
  const [emojis, setEmojis] = useState<(Emoji | EmojiWithSkins)[]>([]);

  useEffect(() => {
    const exec = () => {
      const index = new EmojiIndex(data);
      const categoryEmojis = category.emojis.map((emojiName) => {
        return index.emojis[emojiName] as Emoji | EmojiWithSkins;
      });

      setEmojis(categoryEmojis);
    };

    if (EmojiIndex) {
      exec();
    } else {
      ensureEmojiIndex().then(() => {
        requestAnimationFrame(exec);
      });
    }
  }, [data, category]);

  const { transitionClassNames } = useShowTransition(Boolean(emojis.length));

  return (
    <div
      key={category.id}
      id={`emoji-category-${category.id}`}
      className="symbol-set"
    >
      <p className="symbol-set-name">{category.name}</p>
      <div
        className={['symbol-set-container', ...transitionClassNames].join(' ')}
        // @ts-ignore teact feature
        style={`height: ${categoryHeight}px`}
      >
        {emojis.map((emoji, index) => {
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
