import { useRef } from '../lib/teact/teact';

export default <T extends any>(next: T) => {
  const ref = useRef<T>();
  const { current } = ref;
  ref.current = next;

  return current;
};
