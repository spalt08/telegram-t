import React, {
  FC, useState, useEffect, memo, useRef, useCallback,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiVideo } from '../../../api/types';

import findInViewport from '../../../util/findInViewport';
import buildClassName from '../../../util/buildClassName';
import { throttle } from '../../../util/schedulers';

import Loading from '../../ui/Loading';
import GifButton from './GifButton';

import './GifPicker.scss';

type IProps = {
  className: string;
  load: boolean;
  savedGifs: ApiVideo[];
  onGifSelect: (gif: ApiVideo) => void;
} & Pick<GlobalActions, 'loadSavedGifs'>;

const VIEWPORT_MARGIN = 500;

const runThrottledForScroll = throttle((cb) => cb(), 500, false);

const GifPicker: FC<IProps> = ({
  className,
  load,
  savedGifs,
  onGifSelect,
  loadSavedGifs,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);

  const areLoaded = Boolean(savedGifs.length);

  const updateVisibleIndexes = useCallback(() => {
    const {
      visibleIndexes: newVisibleIndexes,
    } = findInViewport(containerRef.current!, '.GifButton', VIEWPORT_MARGIN, true);
    setVisibleIndexes(newVisibleIndexes);
  }, []);

  useEffect(() => {
    if (load) {
      loadSavedGifs();
    }
  }, [load, loadSavedGifs]);

  useEffect(() => {
    if (areLoaded) {
      updateVisibleIndexes();
    }
  }, [areLoaded, updateVisibleIndexes]);

  const handleScroll = useCallback(() => {
    runThrottledForScroll(updateVisibleIndexes);
  }, [updateVisibleIndexes]);

  return (
    <div
      ref={containerRef}
      className={buildClassName('GifPicker custom-scroll', className)}
      onScroll={handleScroll}
    >
      {!areLoaded ? (
        <Loading />
      ) : (
        savedGifs.map((gif, index) => (
          <GifButton
            key={gif.id}
            gif={gif}
            onGifSelect={onGifSelect}
            loadAndShow={visibleIndexes.includes(index)}
          />
        ))
      )}
    </div>
  );
};

export default memo(withGlobal(
  global => {
    const { gifs: savedGifs } = global.savedGifs;

    return {
      savedGifs,
    };
  },
  (setGlobal, actions) => {
    const { loadSavedGifs } = actions;
    return { loadSavedGifs };
  },
)(GifPicker));
