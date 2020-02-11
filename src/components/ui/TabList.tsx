import React, {
  FC, memo,
} from '../../lib/teact/teact';

import Tab from './Tab';

import './TabList.scss';

type IProps = {
  tabs: string[];
  activeTab: number;
  onSwitchTab: (id: number) => void;
};

const TabList: FC<IProps> = ({ activeTab, tabs, onSwitchTab }) => {
  const handleTabClick = (index: number) => {
    onSwitchTab(index);
  };

  return (
    <div className="TabList">
      {tabs.map((title, index: number) => {
        return (
          <Tab
            key={title}
            id={index}
            title={title}
            active={index === activeTab}
            onClick={handleTabClick}
          />
        );
      })}
      <span className="active-tab" />
    </div>
  );
};

export default memo(TabList);
