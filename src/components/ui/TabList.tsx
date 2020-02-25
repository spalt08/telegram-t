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
        const isNotImplemented = title.startsWith('-');

        return (
          <Tab
            key={title}
            title={isNotImplemented ? title.replace(/^-/, '') : title}
            active={i === activeTab}
            previousActiveTab={previousActiveTab}
            className={isNotImplemented ? 'not-implemented' : undefined}
            onClick={isNotImplemented ? undefined : () => onSwitchTab(i)}
          />
        );
      })}
    </div>
  );
};

export default memo(TabList);
