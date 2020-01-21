import { useEffect, useRef } from '../lib/teact/teact';

export default (value: any) => {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
};
