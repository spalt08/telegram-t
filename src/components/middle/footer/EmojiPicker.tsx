import React, {
  FC, useState, useEffect, memo, useRef, useCallback, useMemo,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalState, GlobalActions } from '../../../global/types';
import { throttle } from '../../../util/schedulers';
import { getPlatform } from '../../../util/environment';

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

type EmojiCategory = { id: string; name: string; emojis: string[] };

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

let isScrollingProgrammatically = false;

async function ensureEmojiData() {
  if (!emojiDataPromise) {
    emojiDataPromise = import('../../../../public/emojiData.json') as unknown as Promise<EmojiData>;
    emojiData = await emojiDataPromise;
  }

  return emojiDataPromise;
}

const runThrottledForScroll = throttle((cb) => cb(), 100, false);
const VIEWPORT_MARGIN = 100;

const EmojiPicker: FC<IProps> = ({
  className, onEmojiSelect, recentEmojis, addRecentEmoji,
}) => {
  const [emojiCategories, setEmojiCategories] = useState<EmojiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState(recentEmojis && recentEmojis.length ? 'recent' : 'people');
  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const exec = () => {
      setEmojiCategories(emojiData.categories);
      setIsLoading(false);
    };

    if (emojiData) {
      exec();
    } else {
      ensureEmojiData().then(() => {
        requestAnimationFrame(exec);
      });
    }
  }, []);

  const selectCategory = useCallback((category: string) => {
    if (currentCategory === category) {
      return;
    }

    setCurrentCategory(category);
    const categoryEl = document.getElementById(`emoji-category-${category}`);
    if (categoryEl) {
      isScrollingProgrammatically = true;
      categoryEl.scrollIntoView();
      requestAnimationFrame(() => { isScrollingProgrammatically = false; });
    }
  }, [currentCategory]);

  const handleScroll = useCallback(
    () => {
      if (isScrollingProgrammatically) {
        return;
      }

      runThrottledForScroll(() => {
        if (!containerRef.current) {
          return;
        }
        const visibleCategory = determineVisibleCategory(containerRef.current);
        if (visibleCategory && visibleCategory !== currentCategory) {
          setCurrentCategory(visibleCategory);
        }
      });
    },
    [containerRef, currentCategory],
  );

  const handleEmojiSelect = useCallback((emoji: string, name: string) => {
    onEmojiSelect(emoji);
    addRecentEmoji({ emoji: name });
  }, [addRecentEmoji, onEmojiSelect]);

  const allEmojiCategories = useMemo(() => {
    const allCategories = [...emojiCategories];
    if (recentEmojis && recentEmojis.length) {
      allCategories.unshift({
        id: 'recent',
        name: 'Recently Used',
        emojis: recentEmojis,
      });
    }

    return allCategories;
  }, [emojiCategories, recentEmojis]);

  function renderEmojiCategoryButton(category: EmojiCategory) {
    const icon = ICONS_BY_CATEGORY[category.id];

    return icon && (
      <Button
        className={`symbol-set-button ${category.id === currentCategory ? 'activated' : ''}`}
        round
        color="translucent"
        onClick={() => selectCategory(category.id)}
        ariaLabel={category.name}
      >
        <i className={icon} />
      </Button>
    );
  }

  if (isLoading) {
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
        className={`EmojiPicker-main custom-scroll ${getPlatform() === 'Mac OS' ? 'mac-os-fix' : ''}`}
        onScroll={handleScroll}
      >
        {allEmojiCategories.map((category) => (
          <EmojiCategory
            data={emojiData}
            category={category}
            onEmojiSelect={handleEmojiSelect}
          />
        ))}
      </div>
      <div className="StickerMenu-footer EmojiPicker-footer">
        {allEmojiCategories.map(renderEmojiCategoryButton)}
      </div>
    </div>
  );
};

function determineVisibleCategory(container: HTMLElement) {
  const allElements = container.querySelectorAll('.symbol-set');
  const containerTop = container.scrollTop;
  const containerBottom = containerTop + container.clientHeight;

  const firstVisibleElement = Array.from(allElements).find((el) => {
    const currentTop = (el as HTMLElement).offsetTop;
    const currentBottom = currentTop + (el as HTMLElement).offsetHeight;
    return currentTop <= containerBottom - VIEWPORT_MARGIN && currentBottom >= containerTop + VIEWPORT_MARGIN;
  });

  if (!firstVisibleElement) {
    return undefined;
  }

  const n = firstVisibleElement.id.lastIndexOf('-');
  return firstVisibleElement.id.substring(n + 1);
}

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
