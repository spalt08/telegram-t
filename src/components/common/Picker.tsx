import React, {
  FC, useCallback, useRef, useEffect, memo,
} from '../../lib/teact/teact';

import { isChatPrivate } from '../../modules/helpers';

import InfiniteScroll from '../ui/InfiniteScroll';
import Checkbox from '../ui/Checkbox';
import InputText from '../ui/InputText';
import ListItem from '../ui/ListItem';
import PrivateChatInfo from './PrivateChatInfo';
import GroupChatInfo from './GroupChatInfo';
import PickerSelectedItem from './PickerSelectedItem';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';

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

  const [viewportIds, getMore] = useInfiniteScroll(onLoadMore, itemIds, Boolean(filterValue));

  return (
    <div className="Picker">
      <div className="picker-header">
        {selectedIds.map((id) => (
          <PickerSelectedItem chatId={id} onClick={() => handleItemClick(id)} />
        ))}
        <InputText
          ref={inputRef}
          value={filterValue}
          onChange={handleFilterChange}
          placeholder={filterPlaceholder || 'Select chat'}
        />
      </div>
      <InfiniteScroll
        className="picker-list custom-scroll optimized-list"
        items={viewportIds}
        onLoadMore={!filterValue ? getMore : undefined}
      >
        <div teactFastList>
          {viewportIds.map((id) => (
            <ListItem
              key={id}
              className="chat-item-clickable picker-list-item"
              onClick={() => handleItemClick(id)}
              ripple
            >
              <Checkbox label="" checked={selectedIds.includes(id)} />
              {isChatPrivate(id) ? (
                <PrivateChatInfo userId={id} />
              ) : (
                <GroupChatInfo chatId={id} />
              )}
            </ListItem>
          ))}
          {!viewportIds.length && (
            <p className="no-results" key="no-results">{notFoundText || 'Sorry, nothing found.'}</p>
          )}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default memo(Picker);
