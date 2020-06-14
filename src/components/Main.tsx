import React, { FC, useEffect, memo } from '../lib/teact/teact';
import { withGlobal } from '../lib/teact/teactn';

import { GlobalState } from '../global/types';

import '../modules/actions/all';
import { pick } from '../util/iteratees';
import buildClassName from '../util/buildClassName';
import { selectIsRightColumnShown } from '../modules/selectors';
import { dispatchHeavyAnimationEvent } from '../hooks/useHeavyAnimationCheck';

import { ANIMATION_END_DELAY, DEBUG } from '../config';
import MediaViewer from './mediaViewer/MediaViewer.async';
import LeftColumn from './left/LeftColumn';
import MiddleColumn from './middle/MiddleColumn';
import RightColumn from './right/RightColumn';
import RightOverlay from './right/RightOverlay';
import ErrorModalContainer from './ui/ErrorModalContainer';

import './Main.scss';

type StateProps = {
  isRightColumnShown?: boolean;
} & Pick<GlobalState, 'isLeftColumnShown'>;

const ANIMATION_DURATION = 350;

let timeout: number | undefined;

let DEBUG_isLogged = false;

const Main: FC<StateProps> = ({
  isLeftColumnShown, isRightColumnShown,
}) => {
  if (DEBUG && !DEBUG_isLogged) {
    DEBUG_isLogged = true;
    // eslint-disable-next-line no-console
    console.log('>>> START RENDERING MAIN');
  }

  const className = buildClassName(
    isLeftColumnShown && 'is-left-column-shown',
  );

  // Add `body` classes when toggling right column
  useEffect(() => {
    document.body.classList.toggle('is-right-column-shown', isRightColumnShown);
    document.body.classList.add('animating-right-column');
    dispatchHeavyAnimationEvent(ANIMATION_DURATION + ANIMATION_END_DELAY);

    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }

    timeout = window.setTimeout(() => {
      document.body.classList.remove('animating-right-column');
      timeout = undefined;
    }, ANIMATION_DURATION + ANIMATION_END_DELAY);
  }, [isRightColumnShown]);

  return (
    <div id="Main" className={className}>
      <MediaViewer />
      <RightOverlay />
      <ErrorModalContainer />
      <LeftColumn />
      <MiddleColumn />
      <RightColumn />
    </div>
  );
};

export default memo(withGlobal(
  (global): StateProps => ({
    ...pick(global, ['isLeftColumnShown']),
    isRightColumnShown: selectIsRightColumnShown(global),
  }),
)(Main));
