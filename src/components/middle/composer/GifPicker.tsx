import React, {
  FC, useState, useEffect, memo, useRef, useCallback,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiVideo } from '../../../api/types';

import findInViewport from '../../../util/findInViewport';
import buildClassName from '../../../util/buildClassName';
import { throttle } from '../../../util/schedulers';
import { pick } from '../../../util/iteratees';

import Loading from '../../ui/Loading';
import GifButton from '../../common/GifButton';

import './GifPicker.scss';

type OwnProps = {
  className: string;
  load: boolean;
  canSendGifs: boolean;
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
  canSendGifs,
  savedGifs,
  onGifSelect,
  loadSavedGifs,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);

  const areLoaded = Boolean(savedGifs);

  const updateVisibleIndexes = useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    const {
      visibleIndexes: newVisibleIndexes,
    } = findInViewport(containerRef.current, '.GifButton', VIEWPORT_MARGIN, true);
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
      {!canSendGifs ? (
        <div className="picker-disabled">Sending GIFs is not allowed in this chat.</div>
      ) : !areLoaded ? (
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
      ) : undefined}
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const { gifs: savedGifs } = global.gifs.saved;

    return {
      savedGifs,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['loadSavedGifs']),
)(GifPicker));
