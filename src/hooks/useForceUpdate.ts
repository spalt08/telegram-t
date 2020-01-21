import { useState } from '../lib/teact/teact';

export default () => {
  const [, setRandom] = useState(0);

  return () => {
    setRandom(Math.random());
  };
};
