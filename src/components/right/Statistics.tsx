import React, {
  FC, memo, useState, useEffect, useRef,
} from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';

import Loading from '../ui/Loading';

import './Statistics.scss';

type ILovelyChart = { create: Function };
let lovelyChartPromise: Promise<ILovelyChart>;
let LovelyChart: ILovelyChart;

async function ensureILovelyChart() {
  if (!lovelyChartPromise) {
    lovelyChartPromise = import('../../lib/lovely-chart/LovelyChart') as Promise<ILovelyChart>;
    LovelyChart = await lovelyChartPromise;
  }

  return lovelyChartPromise;
}

const Statistics: FC = () => {
  const containerRef = useRef<HTMLDivElement>();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      await ensureILovelyChart();

      if (!isReady) {
        setIsReady(true);
        return;
      }

      const growth = await fetchJson('./data/growth.json');
      LovelyChart.create(containerRef.current, growth);

      const notifications = await fetchJson('./data/notifications.json');
      notifications.onZoom = (timestamp: number) => fetchDayData('data/notifications_zoom', timestamp);
      LovelyChart.create(containerRef.current, notifications);

      const interactions = await fetchJson('./data/interactions.json');
      LovelyChart.create(containerRef.current, interactions);

      const views = await fetchJson('./data/views.json');
      views.onZoom = (timestamp: number) => fetchDayData('data/views_zoom', timestamp);
      LovelyChart.create(containerRef.current, views);

      const languages = await fetchJson('./data/languages.json');
      LovelyChart.create(containerRef.current, languages);
    })();
  }, [isReady]);

  return (
    <div className={buildClassName('Statistics custom-scroll', isReady && 'ready')} ref={containerRef}>
      {!isReady && <Loading />}
    </div>
  );
};

function fetchJson(path: string) {
  return fetch(path).then((response) => response.json());
}

function fetchDayData(dataSource: string, timestamp: number) {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const path = `${date.getFullYear()}-${month < 10 ? '0' : ''}${month}/${day < 10 ? '0' : ''}${day}`;

  return fetchJson(`${dataSource}/${path}.json`);
}

export default memo(Statistics);
