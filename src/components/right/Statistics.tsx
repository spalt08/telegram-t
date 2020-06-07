import React, {
  FC, memo, useState, useEffect, useRef,
} from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';

import Loading from '../ui/Loading';

import './Statistics.scss';

type ILovelyChart = { create: Function };
let lovelyChartPromise: Promise<ILovelyChart>;
let LovelyChart: ILovelyChart;

async function ensureLovelyChart() {
  if (!lovelyChartPromise) {
    lovelyChartPromise = import('../../lib/lovely-chart/LovelyChart') as Promise<ILovelyChart>;
    LovelyChart = await lovelyChartPromise;
  }

  return lovelyChartPromise;
}

const Statistics: FC = () => {
  const containerRef = useRef<HTMLDivElement>();
  const [isReady, setIsReady] = useState(false);
  const [loadedChartsCount, setLoadedChartsCount] = useState(0);

  useEffect(() => {
    (async () => {
      await ensureLovelyChart();

      if (!isReady) {
        setIsReady(true);
        return;
      }

      const growth = await fetchJson('./chartDummyData/growth.json');
      LovelyChart.create(containerRef.current, growth);
      setLoadedChartsCount(1);

      const notifications = await fetchJson('./chartDummyData/notifications.json');
      notifications.onZoom = (timestamp: number) => fetchDayData('chartDummyData/notifications_zoom', timestamp);
      LovelyChart.create(containerRef.current, notifications);
      setLoadedChartsCount(2);

      const interactions = await fetchJson('./chartDummyData/interactions.json');
      LovelyChart.create(containerRef.current, interactions);
      setLoadedChartsCount(3);

      const views = await fetchJson('./chartDummyData/views.json');
      views.onZoom = (timestamp: number) => fetchDayData('chartDummyData/views_zoom', timestamp);
      LovelyChart.create(containerRef.current, views);
      setLoadedChartsCount(4);

      const languages = await fetchJson('./chartDummyData/languages.json');
      LovelyChart.create(containerRef.current, languages);
      setLoadedChartsCount(5);
    })();
  }, [isReady]);

  useEffect(() => {
    const chartEls = Array.from(containerRef.current!.querySelectorAll<HTMLDivElement>('.lovely-chart--container'));
    chartEls.forEach((element) => {
      element.classList.add('shown');
    });
  }, [loadedChartsCount]);

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
