import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import { debounce } from '../../util/schedulers';
import { pick } from '../../util/iteratees';
import { selectCurrentMessageSearch } from '../../modules/selectors';

import SearchInput from '../ui/SearchInput';
import Button from '../ui/Button';
import Transition from '../ui/Transition';
import { ProfileState } from './Profile';

import './RightHeader.scss';

type OwnProps = {
  onClose: () => void;
  isForwarding?: boolean;
  isSearch?: boolean;
  profileState?: ProfileState;
};

type StateProps = {
  searchQuery?: string;
};

type DispatchProps = Pick<GlobalActions, 'setMessageSearchQuery' | 'searchMessages'>;

const runDebouncedForSearch = debounce((cb) => cb(), 200, false);

enum HeaderContent {
  Profile,
  SharedMedia,
  MemberList,
  Search,
  Forward,
}

const RightHeader: FC<OwnProps & StateProps & DispatchProps> = ({
  onClose,
  isForwarding,
  isSearch,
  profileState,
  searchQuery,
  setMessageSearchQuery,
  searchMessages,
}) => {
  const handleSearchQueryChange = useCallback((query: string) => {
    setMessageSearchQuery({ query });
    runDebouncedForSearch(searchMessages);
  }, [searchMessages, setMessageSearchQuery]);

  const contentKey = isForwarding ? (
    HeaderContent.Forward
  ) : isSearch ? (
    HeaderContent.Search
  ) : profileState === ProfileState.SharedMedia ? (
    HeaderContent.SharedMedia
  ) : profileState === ProfileState.MemberList ? (
    HeaderContent.MemberList
  ) : HeaderContent.Profile;

  function renderHeaderContent() {
    switch (contentKey) {
      case HeaderContent.Forward:
        return <h3>Forward</h3>;
      case HeaderContent.Search:
        return <SearchInput value={searchQuery} onChange={handleSearchQueryChange} />;
      case HeaderContent.SharedMedia:
        return <h3>Shared Media</h3>;
      case HeaderContent.MemberList:
        return <h3>Members</h3>;
      default:
        return (
          <>
            <h3>Info</h3>
            <Button
              round
              color="translucent"
              size="smaller"
              className="more-button not-implemented"
              ripple
            >
              <i className="icon-more" />
            </Button>
          </>
        );
    }
  }

  const isBackButton = contentKey === HeaderContent.SharedMedia || contentKey === HeaderContent.MemberList;

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

export default withGlobal<OwnProps>(
  (global): StateProps => {
    const { query: searchQuery } = selectCurrentMessageSearch(global) || {};

    return { searchQuery };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['setMessageSearchQuery', 'searchMessages']),
)(RightHeader);
