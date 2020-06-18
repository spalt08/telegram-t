import React, {
  FC, useState, useEffect, memo, useRef, useMemo, useCallback,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalState, GlobalActions } from '../../../global/types';

import { MEMO_EMPTY_ARRAY } from '../../../util/memo';
import {
  EmojiModule,
  EmojiRawData,
  EmojiData,
  uncompressEmoji,
} from '../../../util/emoji';
import { throttle } from '../../../util/schedulers';
import findInViewport from '../../../util/findInViewport';
import fastSmoothScroll from '../../../util/fastSmoothScroll';
import buildClassName from '../../../util/buildClassName';
import { pick } from '../../../util/iteratees';
import useHorizontalScroll from '../../../hooks/useHorizontalScroll';
import { IS_MOBILE_SCREEN } from '../../../util/environment';

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

let emojiDataPromise: Promise<EmojiModule>;
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
    emojiDataPromise = import('emoji-data-ios/emoji-data.json') as unknown as Promise<EmojiModule>;
    emojiRawData = (await emojiDataPromise).default;

    emojiData = uncompressEmoji(emojiRawData);
  }

  return emojiDataPromise;
}

const runThrottledForScroll = throttle((cb) => cb(), 500, false);

// For some reason, parallel `scrollIntoView` executions are conflicting.
const HEADER_SCROLL_DELAY = 500;
const HEADER_BUTTON_WIDTH = 42; // px. Includes margins

const EmojiPicker: FC<OwnProps & StateProps & DispatchProps> = ({
  className, onEmojiSelect, recentEmojis, addRecentEmoji,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const headerRef = useRef<HTMLDivElement>();

  const [categories, setCategories] = useState<EmojiCategoryData[]>();
  const [emojis, setEmojis] = useState<AllEmojis>();
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  useHorizontalScroll(headerRef, !IS_MOBILE_SCREEN);

  // Scroll header when active set updates
  useEffect(() => {
    if (!categories) {
      return;
    }

    setTimeout(() => {
      const header = headerRef.current!;
      const newLeft = activeCategoryIndex * HEADER_BUTTON_WIDTH - header.offsetWidth / 2 + HEADER_BUTTON_WIDTH / 2;

      header.scrollTo({
        left: newLeft,
        behavior: 'smooth',
      });
    }, HEADER_SCROLL_DELAY);
  }, [categories, activeCategoryIndex]);

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
        faded
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
      <div ref={headerRef} className="EmojiPicker-header">
        {allCategories.map(renderCategoryButton)}
      </div>
      <div
        ref={containerRef}
        className="EmojiPicker-main no-selection no-scroll"
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
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => pick(global, ['recentEmojis']),
  (setGlobal, actions): DispatchProps => pick(actions, ['addRecentEmoji']),
)(EmojiPicker));
