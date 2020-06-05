import React, { FC, useEffect, memo } from '../lib/teact/teact';
import { withGlobal } from '../lib/teact/teactn';

import { GlobalActions, GlobalState } from '../global/types';

import '../modules/actions/all';
import { pick } from '../util/iteratees';
import buildClassName from '../util/buildClassName';
import { selectIsRightColumnShown } from '../modules/selectors';

import { ANIMATION_END_DELAY } from '../config';
import MediaViewer from './mediaViewer/MediaViewer.async';
import LeftColumn from './left/LeftColumn';
import MiddleColumn from './middle/MiddleColumn';
import RightColumn from './right/RightColumn';
import RightOverlay from './right/RightOverlay';
import ErrorModalContainer from './ui/ErrorModalContainer';

import './Main.scss';

type StateProps = {
  isRightColumnShown?: boolean;
} & Pick<GlobalState, 'connectionState' | 'isLeftColumnShown'>;
type DispatchProps = Pick<GlobalActions, 'initApi'>;

const ANIMATION_DURATION = 350;

let timeout: number | undefined;

const Main: FC<StateProps & DispatchProps> = ({
  connectionState, isLeftColumnShown, isRightColumnShown, initApi,
}) => {
  useEffect(() => {
    // Initial connection after loading async bundle
    if (connectionState !== 'connectionStateReady') {
      initApi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const className = buildClassName(
    isLeftColumnShown && 'is-left-column-shown',
  );

  // Add `body` classes when toggling right column
  useEffect(() => {
    document.body.classList.toggle('is-right-column-shown', isRightColumnShown);
    document.body.classList.add('animating-right-column');

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
    ...pick(global, ['connectionState', 'isLeftColumnShown']),
    isRightColumnShown: selectIsRightColumnShown(global),
  }),
  (global, actions): DispatchProps => pick(actions, ['initApi']),
)(Main));
