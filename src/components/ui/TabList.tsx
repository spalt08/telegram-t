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
        const isNotImplemented = title.startsWith('-');

        return (
          <Tab
            key={title}
            id={index}
            title={isNotImplemented ? title.replace(/^-/, '') : title}
            active={index === activeTab}
            className={isNotImplemented ? 'not-implemented' : undefined}
            onClick={isNotImplemented ? undefined : handleTabClick}
          />
        );
      })}
      <span className="active-tab" />
    </div>
  );
};

export default memo(TabList);
