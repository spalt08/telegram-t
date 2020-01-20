import { useEffect, useRef } from '../lib/teact';

export default <T extends any[]>(cb: (args: T) => void, dependencies: T) => {
  // @ts-ignore TODO Fix "could be instantiated with a different subtype" issue
  const prevDeps = useRef<T>([]);
  return useEffect(() => {
    cb(prevDeps.current);

    prevDeps.current = dependencies;
  }, dependencies);
};
