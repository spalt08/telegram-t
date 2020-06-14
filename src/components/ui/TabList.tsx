import React, {
  FC, memo, useRef, useEffect,
} from '../../lib/teact/teact';

import usePrevious from '../../hooks/usePrevious';
import useHorizontalScroll from '../../hooks/useHorizontalScroll';

import Tab from './Tab';

import './TabList.scss';

export type TabWithProperties = {
  title: string;
  badgeCount?: number;
  isBadgeActive?: boolean;
};

type OwnProps = {
  tabs: TabWithProperties[];
  activeTab: number;
  onSwitchTab: (index: number) => void;
};

const TAB_SCROLL_THRESHOLD_PX = 16;

const TabList: FC<OwnProps> = ({ tabs, activeTab, onSwitchTab }) => {
  const containerRef = useRef<HTMLDivElement>();
  const previousActiveTab = usePrevious(activeTab);

  useHorizontalScroll(containerRef.current);

  // Scroll container to place active tab in the center
  useEffect(() => {
    const container = containerRef.current!;
    if (container.scrollWidth <= container.offsetWidth) {
      return;
    }

    const activeTabElement = container.querySelector('.Tab.active') as HTMLElement | null;
    if (activeTabElement) {
      const newLeft = activeTabElement.offsetLeft - (container.offsetWidth / 2) + (activeTabElement.offsetWidth / 2);

      // Prevent scrolling by only a couple of pixels, which doesn't look smooth
      if (Math.abs(newLeft - container.scrollLeft) < TAB_SCROLL_THRESHOLD_PX) {
        return;
      }

      container.scrollTo({
        left: newLeft,
        behavior: 'smooth',
      });
    }
  }, [activeTab]);

  return (
    <div className="TabList" ref={containerRef}>
      {tabs.map((tab, i) => (
        <Tab
          key={tab.title}
          title={tab.title}
          active={i === activeTab}
          badgeCount={tab.badgeCount}
          isBadgeActive={tab.isBadgeActive}
          previousActiveTab={previousActiveTab}
          onClick={() => onSwitchTab(i)}
        />
      ))}
    </div>
  );
};

export default memo(TabList);
