import React, {
  FC, memo, useState, useCallback,
} from '../../../lib/teact/teact';

import { LeftColumnContent } from '../../../types';

import Transition from '../../ui/Transition';
import NewGroupStep1 from './NewGroupStep1';
import NewGroupStep2 from './NewGroupStep2';

import './NewGroup.scss';

export type OwnProps = {
  content: LeftColumnContent;
  onContentChange: (content: LeftColumnContent) => void;
  onReset: () => void;
};

const NewGroup: FC<OwnProps> = ({
  content,
  onContentChange,
  onReset,
}) => {
  const [newGroupMemberIds, setNewGroupMemberIds] = useState<number[]>([]);

  const handleNextStep = useCallback(() => {
    onContentChange(LeftColumnContent.NewGroupStep2);
  }, [onContentChange]);

  return (
    <Transition id="NewGroup" name="slide-layers" activeKey={content}>
      {() => {
        switch (content) {
          case LeftColumnContent.NewGroupStep1:
            return (
              <NewGroupStep1
                selectedMemberIds={newGroupMemberIds}
                onSelectedMemberIdsChange={setNewGroupMemberIds}
                onNextStep={handleNextStep}
                onReset={onReset}
              />
            );
          case LeftColumnContent.NewGroupStep2:
            return (
              <NewGroupStep2
                memberIds={newGroupMemberIds}
                onReset={onReset}
              />
            );
          default:
            return undefined;
        }
      }}
    </Transition>
  );
};

export default memo(NewGroup);
