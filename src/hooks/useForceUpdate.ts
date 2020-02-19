import { useState } from '../lib/teact/teact';

export default () => {
  const [, setTrigger] = useState<boolean>(false);

  return () => {
    setTrigger((trigger) => !trigger);
  };
};
