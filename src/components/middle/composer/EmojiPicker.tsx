import React, {
  FC, useState, useEffect, memo, useRef, useMemo, useCallback,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalState, GlobalActions } from '../../../global/types';

import { MEMO_EMPTY_ARRAY } from '../../../util/memo';
import { EmojiRawData, EmojiData, uncompressEmoji } from '../../../util/emoji';
import { throttle } from '../../../util/schedulers';
import findInViewport from '../../../util/findInViewport';
import fastSmoothScroll from '../../../util/fastSmoothScroll';
import buildClassName from '../../../util/buildClassName';
import { pick } from '../../../util/iteratees';

import Button from '../../ui/Button';
import Loading from '../../ui/Loading';
import EmojiCategory from './EmojiCategory';

import './EmojiPicker.scss';

type OwnProps = {
  className?: string;
  onEmojiSelect: (emoji: string) => void;
};

type StateProps = Pick<GlobalState, 'recentEmojis'>;
type DispatchProps = Pick<GlobalActions, 'addRecentEmoji'>;

let emojiDataPromise: Promise<EmojiRawData>;
let emojiRawData: EmojiRawData;
let emojiData: EmojiData;

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
    emojiDataPromise = import('emoji-data-ios/emoji-data.json') as unknown as Promise<EmojiRawData>;
    emojiRawData = await emojiDataPromise;
    emojiData = uncompressEmoji(emojiRawData);
  }

  return emojiDataPromise;
}

const runThrottledForScroll = throttle((cb) => cb(), 500, false);

const EmojiPicker: FC<OwnProps & StateProps & DispatchProps> = ({
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

        setEmojis(emojiData.emojis as AllEmojis);
      };

      if (emojiData) {
        exec();
      } else {
        ensureEmojiData()
          .then(exec);
      }
    }, OPEN_ANIMATION_DELAY);
  }, []);

  const selectCategory = useCallback((index: number) => {
    if (activeCategoryIndex === index) {
      return;
    }

    setActiveCategoryIndex(index);

    const categoryEl = document.getElementById(`emoji-category-${allCategories[index].id}`)!;
    fastSmoothScroll(containerRef.current!, categoryEl, 'start', SMOOTH_SCROLL_DISTANCE);
  }, [activeCategoryIndex, allCategories]);

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

  const containerClassName = buildClassName(
    'EmojiPicker',
    className,
  );

  function preventEvent(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault();
  }

  if (!emojis) {
    return (
      <div className={containerClassName}>
        <Loading />
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <div
        ref={containerRef}
        className="EmojiPicker-main no-scroll"
        onScroll={handleScroll}
        onMouseDown={preventEvent}
      >
        {allCategories.map((category) => (
          <EmojiCategory
            category={category}
            allEmojis={emojis}
            onEmojiSelect={handleEmojiSelect}
          />
        ))}
      </div>
      <div className="EmojiPicker-footer">
        {allCategories.map(renderCategoryButton)}
      </div>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => pick(global, ['recentEmojis']),
  (setGlobal, actions): DispatchProps => pick(actions, ['addRecentEmoji']),
)(EmojiPicker));
