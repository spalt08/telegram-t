import React, {
  FC, useCallback, memo, useMemo,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import { debounce } from '../../util/schedulers';
import { pick } from '../../util/iteratees';
import {
  selectCurrentMessageSearch,
  selectCurrentStickerSearch,
  selectCurrentGifSearch,
} from '../../modules/selectors';

import SearchInput from '../ui/SearchInput';
import Button from '../ui/Button';
import Transition from '../ui/Transition';
import DropdownMenu from '../ui/DropdownMenu';
import MenuItem from '../ui/MenuItem';
import { ProfileState } from './Profile';

import './RightHeader.scss';

type OwnProps = {
  onClose: () => void;
  isForwarding?: boolean;
  isSearch?: boolean;
  isStickerSearch?: boolean;
  isGifSearch?: boolean;
  isStatistics?: boolean;
  profileState?: ProfileState;
};

type StateProps = {
  messageSearchQuery?: string;
  stickerSearchQuery?: string;
  gifSearchQuery?: string;
};

type DispatchProps = Pick<GlobalActions, (
  'setMessageSearchQuery' | 'setStickerSearchQuery' | 'setGifSearchQuery' |
  'searchMessages' | 'toggleStatistics'
)>;

const runDebouncedForSearch = debounce((cb) => cb(), 200, false);

enum HeaderContent {
  Profile,
  SharedMedia,
  Statistics,
  MemberList,
  Search,
  StickerSearch,
  GifSearch,
  Forward,
}

const RightHeader: FC<OwnProps & StateProps & DispatchProps> = ({
  onClose,
  isForwarding,
  isSearch,
  isStickerSearch,
  isGifSearch,
  isStatistics,
  profileState,
  messageSearchQuery,
  stickerSearchQuery,
  gifSearchQuery,
  setMessageSearchQuery,
  setStickerSearchQuery,
  setGifSearchQuery,
  searchMessages,
  toggleStatistics,
}) => {
  const handleMessageSearchQueryChange = useCallback((query: string) => {
    setMessageSearchQuery({ query });
    runDebouncedForSearch(searchMessages);
  }, [searchMessages, setMessageSearchQuery]);

  const handleStickerSearchQueryChange = useCallback((query: string) => {
    setStickerSearchQuery({ query });
  }, [setStickerSearchQuery]);

  const handleGifSearchQueryChange = useCallback((query: string) => {
    setGifSearchQuery({ query });
  }, [setGifSearchQuery]);

  const contentKey = isForwarding ? (
    HeaderContent.Forward
  ) : isSearch ? (
    HeaderContent.Search
  ) : isStickerSearch ? (
    HeaderContent.StickerSearch
  ) : isGifSearch ? (
    HeaderContent.GifSearch
  ) : isStatistics ? (
    HeaderContent.Statistics
  ) : profileState === ProfileState.SharedMedia ? (
    HeaderContent.SharedMedia
  ) : profileState === ProfileState.MemberList ? (
    HeaderContent.MemberList
  ) : HeaderContent.Profile;

  const MenuButton: FC<{ onTrigger: () => void; isOpen?: boolean }> = useMemo(() => {
    return ({ onTrigger, isOpen }) => (
      <Button
        round
        ripple
        size="smaller"
        color="translucent"
        className={isOpen ? 'active' : undefined}
        onMouseDown={onTrigger}
      >
        <i className="icon-more" />
      </Button>
    );
  }, []);

  function renderHeaderContent() {
    switch (contentKey) {
      case HeaderContent.Forward:
        return <h3>Forward</h3>;
      case HeaderContent.Search:
        return <SearchInput value={messageSearchQuery} onChange={handleMessageSearchQueryChange} />;
      case HeaderContent.StickerSearch:
        return (
          <SearchInput
            value={stickerSearchQuery}
            placeholder="Search Stickers"
            onChange={handleStickerSearchQueryChange}
          />
        );
      case HeaderContent.GifSearch:
        return (
          <SearchInput
            value={gifSearchQuery}
            placeholder="Search GIFs"
            onChange={handleGifSearchQueryChange}
          />
        );
      case HeaderContent.Statistics:
        return <h3>Statistics</h3>;
      case HeaderContent.SharedMedia:
        return <h3>Shared Media</h3>;
      case HeaderContent.MemberList:
        return <h3>Members</h3>;
      default:
        return (
          <>
            <h3>Info</h3>
            <DropdownMenu
              trigger={MenuButton}
              positionX="right"
            >
              <MenuItem icon="poll" onClick={toggleStatistics}>Statistics</MenuItem>
            </DropdownMenu>
          </>
        );
    }
  }

  const isBackButton = contentKey === HeaderContent.SharedMedia
    || contentKey === HeaderContent.MemberList
    || contentKey === HeaderContent.StickerSearch;

  return (
    <div className="RightHeader">
      <Button
        className="close-button"
        round
        color="translucent"
        size="smaller"
        onClick={onClose}
      >
        <div className={`animated-close-icon ${isBackButton ? 'state-back' : ''}`} />
      </Button>
      <Transition name="slide-fade" activeKey={contentKey}>
        {renderHeaderContent}
      </Transition>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const { query: messageSearchQuery } = selectCurrentMessageSearch(global) || {};
    const { query: stickerSearchQuery } = selectCurrentStickerSearch(global) || {};
    const { query: gifSearchQuery } = selectCurrentGifSearch(global) || {};

    return {
      messageSearchQuery,
      stickerSearchQuery,
      gifSearchQuery,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'setMessageSearchQuery',
    'setStickerSearchQuery',
    'setGifSearchQuery',
    'searchMessages',
    'toggleStatistics',
  ]),
)(RightHeader));
