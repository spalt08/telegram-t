import usePrevious from './usePrevious';

export default <T extends any[]>(cb: NoneToVoidFunction, dependencies: T) => {
  const prevDeps = usePrevious<T>(dependencies);
  if (!prevDeps || dependencies.some((d, i) => d !== prevDeps[i])) {
    cb();
  }
};
