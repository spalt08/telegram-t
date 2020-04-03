import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import { debounce } from '../../util/schedulers';
import { selectCurrentMessageSearch } from '../../modules/selectors';

import SearchInput from '../ui/SearchInput';
import Button from '../ui/Button';
import Transition from '../ui/Transition';

import './RightHeader.scss';

type OwnProps = {
  onClose: () => void;
  isForwarding?: boolean;
  isSearch?: boolean;
  isSharedMedia?: boolean;
};

type StateProps = {
  searchQuery?: string;
};

type DispatchProps = Pick<GlobalActions, 'setMessageSearchQuery' | 'searchMessages'>;

const runDebouncedForSearch = debounce((cb) => cb(), 200, false);

enum HeaderContent {
  Profile,
  SharedMedia,
  Search,
  Forward,
}

const RightHeader: FC<OwnProps & StateProps & DispatchProps> = ({
  onClose,
  isForwarding,
  isSearch,
  isSharedMedia,
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
  ) : isSharedMedia ? (
    HeaderContent.SharedMedia
  ) : HeaderContent.Profile;

  function renderHeaderContent() {
    switch (contentKey) {
      case HeaderContent.Forward:
        return <h3>Forward</h3>;
      case HeaderContent.Search:
        return <SearchInput value={searchQuery} onChange={handleSearchQueryChange} />;
      case HeaderContent.SharedMedia:
        return <h3>Shared Media</h3>;
      default:
        return (
          <>
            <h3>Info</h3>
            <Button
              round
              color="translucent"
              size="smaller"
              className="more-button not-implemented"
            >
              <i className="icon-more" />
            </Button>
          </>
        );
    }
  }

  return (
    <div className="RightHeader">
      <Button
        className="close-button"
        round
        color="translucent"
        size="smaller"
        onClick={onClose}
      >
        <div className={`animated-close-icon ${contentKey === HeaderContent.SharedMedia ? 'state-back' : ''}`} />
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
  (setGlobal, actions): DispatchProps => {
    const {
      setMessageSearchQuery, searchMessages,
    } = actions;
    return {
      setMessageSearchQuery, searchMessages,
    };
  },
)(RightHeader);
