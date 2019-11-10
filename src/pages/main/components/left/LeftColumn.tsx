import React, { FC } from '../../../../lib/teact';

import ChatList from './ChatList';
import LeftHeader from './LeftHeader';
import './LeftColumn.scss';

const LeftColumn: FC = () => {
  return (
    <div id="LeftColumn">
      <LeftHeader />
      <ChatList />
    </div>
  );
};

export default LeftColumn;
