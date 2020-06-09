import { useCallback, useState } from '../lib/teact/teact';

export default (isDisabled = false): [boolean, AnyToVoidFunction, AnyToVoidFunction] => {
  const [isOpen, setIsOpen] = useState(false);

  const setTrue = useCallback(() => {
    if (isDisabled) {
      return;
    }

    setIsOpen(true);
  }, [isDisabled]);

  const setFalse = useCallback(() => {
    setIsOpen(false);
  }, []);

  return [isOpen, setTrue, setFalse];
};
