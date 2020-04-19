import React, { FC, useEffect } from '../lib/teact/teact';
import { withGlobal } from '../lib/teact/teactn';

import { GlobalActions, GlobalState } from '../global/types';

import '../modules/actions/all';

import { pick } from '../util/iteratees';

import MediaViewer from './mediaViewer/MediaViewer.async';
import LeftColumn from './left/LeftColumn';
import MiddleColumn from './middle/MiddleColumn';
import RightColumn from './right/RightColumn';
import RightOverlay from './right/RightOverlay';
import ErrorModalContainer from './ui/ErrorModalContainer';

import './Main.scss';

type StateProps = Pick<GlobalState, 'connectionState'>;
type DispatchProps = Pick<GlobalActions, 'initApi'>;

const Main: FC<StateProps & DispatchProps> = ({ connectionState, initApi }) => {
  useEffect(() => {
    document.body.classList.add('no-overflow');

    // Initial connection after loading async bundle
    if (connectionState !== 'connectionStateReady') {
      initApi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="Main">
      <MediaViewer />
      <RightOverlay />
      <ErrorModalContainer />
      <LeftColumn />
      <MiddleColumn />
      <RightColumn />
    </div>
  );
};

export default withGlobal(
  (global): StateProps => pick(global, ['connectionState']),
  (global, actions): DispatchProps => pick(actions, ['initApi']),
)(Main);
