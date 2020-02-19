import { useEffect, useRef } from '../lib/teact/teact';

export default <T extends any>(value: T) => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
};
