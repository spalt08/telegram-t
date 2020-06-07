import { FC, useRef, useLayoutEffect } from '../../lib/teact/teact';
import TeactDOM from '../../lib/teact/teact-dom';

const Portal: FC<{ children: any }> = ({ children }) => {
  const elementRef = useRef(document.createElement('div'));

  useLayoutEffect(() => {
    const container = document.querySelector<HTMLDivElement>('#portals');
    if (!container) {
      return undefined;
    }

    const element = elementRef.current;

    container.appendChild(element);

    return () => {
      container.removeChild(element);
    };
  }, []);

  return TeactDOM.render(children, elementRef.current);
};

export default Portal;
