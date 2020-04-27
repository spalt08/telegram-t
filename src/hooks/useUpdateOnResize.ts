import { useEffect } from '../lib/teact/teact';
import { throttle } from '../util/schedulers';

import useForceUpdate from './useForceUpdate';

export default () => {
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const handleResize = throttle(() => {
      forceUpdate();
    }, 250, false);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
};
