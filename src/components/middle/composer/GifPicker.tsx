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

type OwnProps = {
  className: string;
  load: boolean;
  onGifSelect: (gif: ApiVideo) => void;
};

type StateProps = {
  savedGifs?: ApiVideo[];
};

type DispatchProps = Pick<GlobalActions, 'loadSavedGifs'>;

const VIEWPORT_MARGIN = 500;

const runThrottledForScroll = throttle((cb) => cb(), 500, false);

const GifPicker: FC<OwnProps & StateProps & DispatchProps> = ({
  className,
  load,
  savedGifs,
  onGifSelect,
  loadSavedGifs,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);

  const areLoaded = Boolean(savedGifs);

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
      className={buildClassName('GifPicker no-scroll', className)}
      onScroll={handleScroll}
    >
      {!areLoaded ? (
        <Loading />
      ) : savedGifs ? (
        savedGifs.map((gif, index) => (
          <GifButton
            key={gif.id}
            gif={gif}
            onClick={onGifSelect}
            load={visibleIndexes.includes(index)}
          />
        ))
      ) : null}
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
