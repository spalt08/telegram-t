import React, {
  FC, memo, useRef, useState, useCallback, useEffect,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiChat, ApiVideo } from '../../api/types';

import { selectCurrentGifSearch, selectChat, selectIsChatWithBot } from '../../modules/selectors';
import { getAllowedAttachmentOptions } from '../../modules/helpers';
import { pick } from '../../util/iteratees';
import { MEMO_EMPTY_ARRAY } from '../../util/memo';
import findInViewport from '../../util/findInViewport';
import { throttle } from '../../util/schedulers';

import InfiniteScroll from '../ui/InfiniteScroll';
import GifButton from '../common/GifButton';

import './GifSearch.scss';

type StateProps = {
  query?: string;
  results?: ApiVideo[];
  chat?: ApiChat;
  isChatWithBot?: boolean;
};

type DispatchProps = Pick<GlobalActions, 'searchMoreGifs' | 'sendMessage'>;

const VIEWPORT_MARGIN = 500;

const runThrottledForScroll = throttle((cb) => cb(), 500, false);

const GifSearch: FC<StateProps & DispatchProps> = ({
  query,
  results,
  chat,
  isChatWithBot,
  searchMoreGifs,
  sendMessage,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);

  const { canSendGifs } = getAllowedAttachmentOptions(chat, isChatWithBot);

  const foundResults = results || MEMO_EMPTY_ARRAY;

  const updateVisibleIndexes = useCallback(() => {
    const {
      visibleIndexes: newVisibleIndexes,
    } = findInViewport(containerRef.current!, '.GifButton', VIEWPORT_MARGIN, true);
    setVisibleIndexes(newVisibleIndexes);
  }, []);

  useEffect(() => {
    updateVisibleIndexes();
  }, [foundResults.length, updateVisibleIndexes]);

  const handleScroll = useCallback(() => {
    runThrottledForScroll(updateVisibleIndexes);
  }, [updateVisibleIndexes]);

  const handleGifClick = useCallback((gif: ApiVideo) => {
    if (canSendGifs) {
      sendMessage({ gif });
    }
  }, [sendMessage, canSendGifs]);

  function renderSearchResult(gif: ApiVideo, index: number) {
    return (
      <GifButton
        key={gif.id}
        gif={gif}
        onClick={(g) => handleGifClick(g)}
        load={visibleIndexes.includes(index)}
      />
    );
  }

  return (
    <InfiniteScroll
      ref={containerRef}
      className="GifSearch custom-scroll"
      items={foundResults}
      preloadBackwards={0}
      onLoadMore={searchMoreGifs}
      onScroll={handleScroll}
    >
      {foundResults.length ? (
        foundResults.map(renderSearchResult)
      ) : (
        <p className="helper-text">
          {query ? 'Nothing Found' : 'Start typing to search GIFs'}
        </p>
      )}
    </InfiniteScroll>
  );
};

export default memo(withGlobal(
  (global): StateProps => {
    const currentSearch = selectCurrentGifSearch(global);
    const { query, results } = currentSearch || {};

    const chatId = global.chats.selectedId;
    const chat = chatId ? selectChat(global, chatId) : undefined;
    const isChatWithBot = chatId ? selectIsChatWithBot(global, chatId) : undefined;

    return {
      query,
      results,
      chat,
      isChatWithBot,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['searchMoreGifs', 'sendMessage']),
)(GifSearch));
