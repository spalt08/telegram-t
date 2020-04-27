import React, { FC, useEffect } from '../lib/teact/teact';
import { withGlobal } from '../lib/teact/teactn';

import { GlobalActions, GlobalState } from '../global/types';

import '../modules/actions/all';
import { pick } from '../util/iteratees';
import buildClassName from '../util/buildClassName';

import MediaViewer from './mediaViewer/MediaViewer.async';
import LeftColumn from './left/LeftColumn';
import MiddleColumn from './middle/MiddleColumn';
import RightColumn from './right/RightColumn';
import RightOverlay from './right/RightOverlay';
import ErrorModalContainer from './ui/ErrorModalContainer';

import './Main.scss';
import { selectIsForwardMenuOpen, selectIsMediaViewerOpen, selectCurrentMessageSearch } from '../modules/selectors';

type StateProps = {
  isRightColumnShown?: boolean;
} & Pick<GlobalState, 'connectionState' | 'isLeftColumnShown'>;
type DispatchProps = Pick<GlobalActions, 'initApi'>;

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
    isRightColumnShown && 'is-right-column-shown',
  );

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

export default withGlobal(
  (global): StateProps => {
    const {
      chats,
      users,
      isChatInfoShown,
    } = global;

    const areChatsLoaded = Boolean(chats.listIds);
    const isForwarding = selectIsForwardMenuOpen(global) && !selectIsMediaViewerOpen(global);
    const currentSearch = selectCurrentMessageSearch(global);
    const isSearch = Boolean(currentSearch && currentSearch.currentType === 'text');
    const isUserInfo = Boolean(users.selectedId && areChatsLoaded);
    const isChatInfo = Boolean(chats.selectedId && isChatInfoShown && areChatsLoaded);

    return {
      ...pick(global, ['connectionState', 'isLeftColumnShown']),
      isRightColumnShown: isChatInfo || isUserInfo || isForwarding || isSearch,
    };
  },
  (global, actions): DispatchProps => pick(actions, ['initApi']),
)(Main);
