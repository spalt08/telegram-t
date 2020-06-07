import React, {
  FC, useCallback, useRef, useEffect, memo,
} from '../../lib/teact/teact';

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
  onLoadMore?: () => void;
};

// Focus slows down animation, also it breaks transition layout in Chrome
const FOCUS_DELAY_MS = 500;

const Picker: FC<OwnProps> = ({
  itemIds,
  selectedIds,
  filterValue,
  filterPlaceholder,
  notFoundText,
  onSelectedIdsChange,
  onFilterChange,
  onLoadMore,
}) => {
  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    setTimeout(() => {
      requestAnimationFrame(() => {
        inputRef.current!.focus();
      });
    }, FOCUS_DELAY_MS);
  }, []);

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
      <div key={id} className="chat-item-clickable has-ripple picker-list-item" onClick={() => handleItemClick(id)}>
        <Checkbox
          label=""
          checked={selectedIds.includes(id)}
        />
        {isChatPrivate(id) ? (
          <PrivateChatInfo userId={id} />
        ) : (
          <GroupChatInfo chatId={id} />
        )}
        <RippleEffect />
      </div>
    );
  }

  function renderList() {
    const content = (
      <>
        {itemIds.map(renderItem)}
        {!itemIds.length && (
          <p className="no-results">{notFoundText || 'Sorry, nothing found.'}</p>
        )}
      </>
    );

    if (onLoadMore) {
      return (
        <InfiniteScroll className="picker-list custom-scroll" items={itemIds} onLoadMore={onLoadMore}>
          {content}
        </InfiniteScroll>
      );
    }

    return (
      <div className="picker-list custom-scroll">
        {content}
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
      {renderList()}
    </div>
  );
};

export default memo(Picker);
