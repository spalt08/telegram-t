import React, { FC } from '../../../../lib/teact';

import ChatList from './ChatList';
import './LeftColumn.scss';

const LeftColumn: FC = () => {
  return (
    <div id="LeftColumn">
      <ChatList />
    </div>
  );
};

export default LeftColumn;
