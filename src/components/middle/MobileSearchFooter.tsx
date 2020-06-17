import React, {
  FC, memo, useCallback, useEffect, useState,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import { debounce } from '../../util/schedulers';
import { selectCurrentMessageSearch, selectOpenChat } from '../../modules/selectors';
import { pick } from '../../util/iteratees';
import { ApiChat, ApiMessage } from '../../api/types';
import useFlag from '../../hooks/useFlag';
import buildClassName from '../../util/buildClassName';

import Button from '../ui/Button';
import SearchInput from '../ui/SearchInput';

import './MobileSearchFooter.scss';

type StateProps = {
  chat?: ApiChat;
  messagesById?: Record<number, ApiMessage>;
  query?: string;
  totalCount?: number;
  foundIds?: number[];
};

type DispatchProps = Pick<GlobalActions, (
  'setMessageSearchQuery' | 'searchMessages' | 'focusMessage' | 'closeMessageTextSearch'
)>;

const KEYBOARD_DELAY = 100;

const runDebouncedForSearch = debounce((cb) => cb(), 200, false);

const MobileSearchFooter: FC<StateProps & DispatchProps> = ({
  chat,
  query,
  totalCount,
  foundIds,
  setMessageSearchQuery,
  searchMessages,
  focusMessage,
  closeMessageTextSearch,
}) => {
  const [isFocused, focus, blur] = useFlag();
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    if (chat && foundIds && foundIds.length) {
      focusMessage({ chatId: chat.id, messageId: foundIds[foundIds.length - 1] });
      setFocusedIndex(0);
    } else {
      setFocusedIndex(-1);
    }
  }, [chat, focusMessage, foundIds]);

  const handleMessageSearchQueryChange = useCallback((newQuery: string) => {
    setMessageSearchQuery({ query: newQuery });

    if (newQuery.length) {
      runDebouncedForSearch(searchMessages);
    }
  }, [searchMessages, setMessageSearchQuery]);

  const handleFocus = useCallback(() => {
    const originalHeight = window.innerHeight;
    const magicHeader = document.querySelector<HTMLDivElement>('.magic-header')!;
    const originalTop = magicHeader.getBoundingClientRect().top;

    setTimeout(() => {
      const reducedHeight = window.innerHeight;

      magicHeader.style
        .setProperty('--translate-y', `-${originalTop - (originalHeight - reducedHeight)}px`);

      // Disable native up/down buttons
      (document.getElementById('telegram-search-input') as HTMLInputElement).disabled = true;

      focus();
    }, KEYBOARD_DELAY);
  }, [focus]);

  const handleBlur = useCallback(() => {
    blur();

    (document.getElementById('telegram-search-input') as HTMLInputElement).disabled = false;

    closeMessageTextSearch();
  }, [blur, closeMessageTextSearch]);

  const handleCloseSearch = useCallback(() => {
    document.getElementById('magic-input')!.blur();
    closeMessageTextSearch();
  }, [closeMessageTextSearch]);

  useEffect(() => {
    if (!isFocused) {
      return undefined;
    }

    function blurInput() {
      document.getElementById('magic-input')!.blur();
    }

    window.addEventListener('scroll', blurInput);
    return () => {
      window.removeEventListener('scroll', blurInput);
    };
  }, [isFocused]);

  const handleUp = useCallback(() => {
    if (chat && foundIds) {
      const newFocusIndex = focusedIndex + 1;
      focusMessage({ chatId: chat.id, messageId: foundIds[foundIds.length - 1 - newFocusIndex] });
      setFocusedIndex(newFocusIndex);
    }
  }, [chat, focusedIndex, focusMessage, foundIds]);

  const handleDown = useCallback(() => {
    if (chat && foundIds) {
      const newFocusIndex = focusedIndex - 1;
      focusMessage({ chatId: chat.id, messageId: foundIds[foundIds.length - 1 - newFocusIndex] });
      setFocusedIndex(newFocusIndex);
    }
  }, [chat, focusedIndex, focusMessage, foundIds]);

  return (
    <div id="MobileSearchFooter" className={buildClassName(isFocused && 'focused')}>
      <div className="magic-header">
        <Button
          size="smaller"
          round
          color="translucent"
          onClick={handleCloseSearch}
        >
          <i className="icon-back" />
        </Button>
        <SearchInput
          inputId="magic-input"
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={query}
          onChange={handleMessageSearchQueryChange}
        />
      </div>
      <div className="counter">
        {foundIds && foundIds.length ? (
          `${focusedIndex + 1} of ${totalCount}`
        ) : foundIds && !foundIds.length ? (
          'No results'
        ) : (
          ''
        )}
      </div>
      <Button
        round
        size="smaller"
        color="translucent"
        onClick={handleUp}
        disabled={!foundIds || !foundIds.length || focusedIndex === foundIds.length - 1}
      >
        <i className="icon-up" />
      </Button>
      <Button
        round
        size="smaller"
        color="translucent"
        onClick={handleDown}
        disabled={!foundIds || !foundIds.length || focusedIndex === 0}
      >
        <i className="icon-down" />
      </Button>
    </div>
  );
};

export default memo(withGlobal(
  (global): StateProps => {
    const chat = selectOpenChat(global);
    if (!chat) {
      return {};
    }

    const currentSearch = selectCurrentMessageSearch(global);
    const { query, resultsByType } = currentSearch || {};
    const { totalCount, foundIds } = (resultsByType && resultsByType.text) || {};

    return {
      query,
      chat,
      totalCount,
      foundIds,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'setMessageSearchQuery',
    'searchMessages',
    'focusMessage',
    'closeMessageTextSearch',
  ]),
)(MobileSearchFooter));
