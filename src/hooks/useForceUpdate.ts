import { useState } from '../lib/reactt';

export default  () => {
  const [, setRandom] = useState(0);

  return () => {
    setRandom(Math.random());
  }
};
