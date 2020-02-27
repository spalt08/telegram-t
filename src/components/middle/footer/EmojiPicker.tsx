import React, {
  FC, useState, useEffect, memo, useRef, useMemo, useCallback,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalState, GlobalActions } from '../../../global/types';

import { MEMO_EMPTY_ARRAY } from '../../../util/memo';
import { throttle } from '../../../util/schedulers';
import findInViewport from '../../../util/findInViewport';
import fastSmoothScroll from '../../../util/fastSmoothScroll';

import Button from '../../ui/Button';
import Loading from '../../ui/Loading';
import EmojiCategory from './EmojiCategory';

import './EmojiPicker.scss';

type IProps = {
  className?: string;
  onEmojiSelect: (emoji: string) => void;
} & Pick<GlobalState, 'recentEmojis'> & Pick<GlobalActions, 'addRecentEmoji'>;

type EmojiData = typeof import('../../../../public/emojiData.json');
let emojiDataPromise: Promise<EmojiData>;
let emojiData: EmojiData;

type NimbleEmojiIndexLib = typeof import('emoji-mart/dist-es/utils/emoji-index/nimble-emoji-index');
let emojiIndexPromise: Promise<NimbleEmojiIndexLib>;
let EmojiIndex: NimbleEmojiIndexLib['default'];

type EmojiCategoryData = { id: string; name: string; emojis: string[] };

const ICONS_BY_CATEGORY: Record<string, string> = {
  recent: 'icon-recent',
  people: 'icon-smile',
  nature: 'icon-animals',
  foods: 'icon-eats',
  activity: 'icon-sport',
  places: 'icon-car',
  objects: 'icon-lamp',
  symbols: 'icon-language',
  flags: 'icon-flag',
};

const OPEN_ANIMATION_DELAY = 200;
// Only a few categories are above this height.
const SMOOTH_SCROLL_DISTANCE = 800;

async function ensureEmojiData() {
  if (!emojiDataPromise) {
    emojiDataPromise = import('../../../../public/emojiData.json') as unknown as Promise<EmojiData>;
    emojiData = await emojiDataPromise;
  }

  return emojiDataPromise;
}

async function ensureEmojiIndex() {
  if (!emojiIndexPromise) {
    // eslint-disable-next-line max-len
    emojiIndexPromise = import('emoji-mart/dist-es/utils/emoji-index/nimble-emoji-index') as unknown as Promise<NimbleEmojiIndexLib>;
    EmojiIndex = (await emojiIndexPromise).default;
  }

  return emojiIndexPromise;
}

const runThrottledForScroll = throttle((cb) => cb(), 500, false);

const EmojiPicker: FC<IProps> = ({
  className, onEmojiSelect, recentEmojis, addRecentEmoji,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const [categories, setCategories] = useState<EmojiCategoryData[]>();
  const [emojis, setEmojis] = useState<AllEmojis>();
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  const allCategories = useMemo(() => {
    if (!categories) {
      return MEMO_EMPTY_ARRAY;
    }
    const themeCategories = [...categories];
    if (recentEmojis && recentEmojis.length) {
      themeCategories.unshift({
        id: 'recent',
        name: 'Recently Used',
        emojis: recentEmojis,
      });
    }

    return themeCategories;
  }, [categories, recentEmojis]);

  // Initialize data on first render.
  useEffect(() => {
    setTimeout(() => {
      const exec = () => {
        setCategories(emojiData.categories);

        const index = new EmojiIndex(emojiData);
        setEmojis(index.emojis as AllEmojis);
      };

      if (emojiData && EmojiIndex) {
        exec();
      } else {
        Promise.all([
          ensureEmojiData(),
          ensureEmojiIndex(),
        ]).then(exec);
      }
    }, OPEN_ANIMATION_DELAY);
  }, []);

  const shouldShowCategory = useCallback((index: number) => {
    return Math.abs(activeCategoryIndex - index) <= 1;
  }, [activeCategoryIndex]);

  const selectCategory = useCallback((index: number) => {
    if (activeCategoryIndex === index) {
      return;
    }

    setActiveCategoryIndex(index);

    const categoryEl = document.getElementById(`emoji-category-${allCategories[index].id}`)!;
    const isShown = shouldShowCategory(index);

    if (isShown) {
      fastSmoothScroll(containerRef.current!, categoryEl, 'start', SMOOTH_SCROLL_DISTANCE);
    } else {
      categoryEl.scrollIntoView();
    }
  }, [activeCategoryIndex, allCategories, shouldShowCategory]);

  const handleScroll = useCallback(() => {
    runThrottledForScroll(() => {
      const { visibleIndexes } = findInViewport(containerRef.current!, '.symbol-set');
      setActiveCategoryIndex(visibleIndexes[0]);
    });
  }, []);

  const handleEmojiSelect = useCallback((emoji: string, name: string) => {
    onEmojiSelect(emoji);
    addRecentEmoji({ emoji: name });
  }, [addRecentEmoji, onEmojiSelect]);

  function renderCategoryButton(category: EmojiCategoryData, index: number) {
    const icon = ICONS_BY_CATEGORY[category.id];

    return icon && (
      <Button
        className={`symbol-set-button ${index === activeCategoryIndex ? 'activated' : ''}`}
        round
        color="translucent"
        onClick={() => selectCategory(index)}
        ariaLabel={category.name}
      >
        <i className={icon} />
      </Button>
    );
  }

  if (!emojis) {
    return (
      <div className={`EmojiPicker ${className || ''}`}>
        <Loading />
      </div>
    );
  }

  return (
    <div className={`EmojiPicker ${className || ''}`}>
      <div
        ref={containerRef}
        className="EmojiPicker-main custom-scroll"
        onScroll={handleScroll}
      >
        {allCategories.map((category, i) => (
          <EmojiCategory
            category={category}
            allEmojis={emojis}
            onEmojiSelect={handleEmojiSelect}
            show={shouldShowCategory(i)}
          />
        ))}
      </div>
      <div className="StickerMenu-footer EmojiPicker-footer">
        {allCategories.map(renderCategoryButton)}
      </div>
    </div>
  );
};

export default memo(withGlobal(
  global => {
    const { recentEmojis } = global;
    return { recentEmojis };
  },
  (setGlobal, actions) => {
    const { addRecentEmoji } = actions;
    return { addRecentEmoji };
  },
)(EmojiPicker));
