import { useCallback, useState } from '../lib/teact/teact';
import useOnChange from './useOnChange';

export default (url?: string) => {
  const [isBuffered, setIsBuffered] = useState(false);

  const handleBuffering = useCallback(() => {
    setIsBuffered(true);
  }, []);

  // Used only by Media Viewer.
  useOnChange(() => {
    setIsBuffered(false);
  }, [url]);

  return {
    isBuffered,
    handleBuffering,
    setIsBuffered,
  };
};
