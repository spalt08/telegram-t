import { useCallback, useState } from '../lib/teact/teact';

export default (isDisabled = false): [boolean, AnyToVoidFunction, AnyToVoidFunction] => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    if (isDisabled) {
      return;
    }

    setIsOpen(true);
  }, [isDisabled]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return [isOpen, open, close];
};
