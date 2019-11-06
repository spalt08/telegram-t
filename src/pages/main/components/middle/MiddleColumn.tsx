import React, { FC } from '../../../../lib/reactt';
import { withGlobal } from '../../../../lib/reactnt';

import './MiddleColumn.scss';

type IProps = {
  selectedChatId: number;
};

const MiddleColumn: FC<IProps> = ({ selectedChatId }) => {
  return (
    <div className="MiddleColumn">
      {selectedChatId ? (
        <div>Selected chat ID: {selectedChatId}</div>
      ) : (
        <div>Select chat to start messaging...</div>
      )}
    </div>
  );
};

export default withGlobal(
  (global) => {
    return {
      selectedChatId: global.chats && global.chats.selectedId,
    };
  },
)(MiddleColumn);
