import React, {
  FC, useCallback, useEffect, useState, useMemo, memo,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ApiUser } from '../../../api/types';

import { pick } from '../../../util/iteratees';
import { throttle } from '../../../util/schedulers';
import searchWords from '../../../util/searchWords';
import { getSortedUserIds, getUserFullName } from '../../../modules/helpers';

import Picker from '../../common/Picker';
import FloatingActionButton from '../../ui/FloatingActionButton';

import './NewGroup.scss';

export type OwnProps = {
  selectedMemberIds: number[];
  onSelectedMemberIdsChange: (ids: number[]) => void;
  onNextStep: () => void;
};

type StateProps = {
  usersById: Record<number, ApiUser>;
  contactIds?: number[];
};

type DispatchProps = Pick<GlobalActions, 'loadContactList'>;

const runThrottled = throttle((cb) => cb(), 60000, true);

const NewGroupStep1: FC<OwnProps & StateProps & DispatchProps> = ({
  selectedMemberIds,
  onSelectedMemberIdsChange,
  onNextStep,
  usersById,
  contactIds,
  loadContactList,
}) => {
  const [filter, setFilter] = useState('');

  // Due to the parent Transition, this component never gets unmounted,
  // that's why we use throttled API call on every update.
  useEffect(() => {
    runThrottled(() => {
      loadContactList();
    });
  });

  const displayedIds = useMemo(() => {
    if (!contactIds) {
      return [];
    }

    const resultIds = filter ? contactIds.filter((id) => {
      const user = usersById[id];
      if (!user) {
        return false;
      }
      const fullName = getUserFullName(user);
      return fullName && searchWords(fullName, filter);
    }) : contactIds;

    return getSortedUserIds(resultIds, usersById, selectedMemberIds);
  }, [filter, selectedMemberIds, usersById, contactIds]);

  const handleNextStep = useCallback(() => {
    if (selectedMemberIds.length) {
      onNextStep();
    }
  }, [selectedMemberIds, onNextStep]);

  return (
    <div className="NewGroup step-1">
      <Picker
        itemIds={displayedIds}
        selectedIds={selectedMemberIds}
        filterValue={filter}
        filterPlaceholder="Add People..."
        onSelectedIdsChange={onSelectedMemberIdsChange}
        onFilterChange={setFilter}
      />

      <FloatingActionButton
        show={Boolean(selectedMemberIds.length)}
        onClick={handleNextStep}
      >
        <i className="icon-next" />
      </FloatingActionButton>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const { userIds: contactIds } = global.contactList || {};
    const { byId: usersById } = global.users;

    return {
      usersById,
      contactIds,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['loadContactList']),
)(NewGroupStep1));
