import { useLayoutEffect, useRef } from '../lib/teact/teact';

export default <T extends any[]>(cb: (args: T) => void, dependencies: T) => {
  // @ts-ignore TODO Fix "could be instantiated with a different subtype" issue
  const prevDeps = useRef<T>([]);
  return useLayoutEffect(() => {
    cb(prevDeps.current);

    prevDeps.current = dependencies;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};
