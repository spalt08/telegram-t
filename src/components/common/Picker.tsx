import React, {
  FC, useCallback, useRef, useEffect,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalState } from '../../global/types';

import { isChatPrivate } from '../../modules/helpers';

import RippleEffect from '../ui/RippleEffect';
import InfiniteScroll from '../ui/InfiniteScroll';
import Checkbox from '../ui/Checkbox';
import InputText from '../ui/InputText';
import PrivateChatInfo from './PrivateChatInfo';
import GroupChatInfo from './GroupChatInfo';
import PickerSelectedItem from './PickerSelectedItem';

import './Picker.scss';

type OwnProps = {
  itemIds: number[];
  selectedIds: number[];
  filterValue?: string;
  filterPlaceholder?: string;
  notFoundText?: string;
  onSelectedIdsChange: (ids: number[]) => void;
  onFilterChange: (value: string) => void;
  onLoadMore: () => void;
};

type StateProps = Pick<GlobalState, 'currentUserId'>;

const Picker: FC<OwnProps & StateProps> = ({
  itemIds,
  selectedIds,
  filterValue,
  filterPlaceholder,
  notFoundText,
  currentUserId,
  onSelectedIdsChange,
  onFilterChange,
  onLoadMore,
}) => {
  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    inputRef.current!.focus();
  }, [inputRef]);

  const handleItemClick = useCallback((id: number) => {
    const newSelectedIds = [...selectedIds];
    if (newSelectedIds.includes(id)) {
      newSelectedIds.splice(newSelectedIds.indexOf(id), 1);
    } else {
      newSelectedIds.push(id);
    }
    onSelectedIdsChange(newSelectedIds);
  }, [selectedIds, onSelectedIdsChange]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    onFilterChange(value);
  }, [onFilterChange]);

  function renderItem(id: number) {
    return (
      <div key={id} className="picker-list-item" onClick={() => handleItemClick(id)}>
        <Checkbox
          label=""
          checked={selectedIds.includes(id)}
        />
        {isChatPrivate(id) ? (
          <PrivateChatInfo userId={id} isSavedMessages={id === currentUserId} />
        ) : (
          <GroupChatInfo chatId={id} />
        )}
        <RippleEffect />
      </div>
    );
  }

  return (
    <div className="Picker">
      <div className="picker-header">
        {selectedIds.map((id) => <PickerSelectedItem chatId={id} onClick={() => handleItemClick(id)} />)}
        <InputText
          ref={inputRef}
          value={filterValue}
          onChange={handleFilterChange}
          placeholder={filterPlaceholder || 'Select chat'}
        />
      </div>
      <InfiniteScroll className="picker-list custom-scroll" items={itemIds} onLoadMore={onLoadMore}>
        {itemIds.map(renderItem)}
        {!itemIds.length && (
          <p className="no-results">{notFoundText || 'Sorry, nothing found.'}</p>
        )}
      </InfiniteScroll>
    </div>
  );
};

export default withGlobal(
  (global) => {
    const { currentUserId } = global;
    return { currentUserId };
  },
)(Picker);
