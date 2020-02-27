import React, { FC, memo } from '../../lib/teact/teact';

import usePrevious from '../../hooks/usePrevious';

import Tab from './Tab';

import './TabList.scss';

type IProps = {
  tabs: string[];
  activeTab: number;
  onSwitchTab: (index: number) => void;
};

const TabList: FC<IProps> = ({ tabs, activeTab, onSwitchTab }) => {
  const previousActiveTab = usePrevious(activeTab);

  return (
    <div className="TabList">
      {tabs.map((title, i: number) => {
        return (
          <Tab
            key={title}
            title={title}
            active={i === activeTab}
            previousActiveTab={previousActiveTab}
            onClick={() => onSwitchTab(i)}
          />
        );
      })}
    </div>
  );
};

export default memo(TabList);
