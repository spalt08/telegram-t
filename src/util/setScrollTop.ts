import { IS_TOUCH_ENV } from './environment';

export default (container: HTMLDivElement, scrollTop: number) => {
  if (IS_TOUCH_ENV) {
    container.style.overflow = 'hidden';
  }

  container.scrollTop = scrollTop;

  if (IS_TOUCH_ENV) {
    container.style.overflow = '';
  }
};
