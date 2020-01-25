type IHandlerFunction = () => void;

const handlers: Array<IHandlerFunction> = [];

function handleKeyDown(e: KeyboardEvent) {
  if (handlers.length > 0 && (e.key === 'Escape' || e.key === 'Esc')) {
    const handler = handlers.pop();
    handler!();
  }
}

export default function captureEscKeyListener(handler: IHandlerFunction) {
  if (handlers.length === 0) {
    document.addEventListener('keydown', handleKeyDown, false);
  }

  handlers.push(handler);

  return () => {
    releaseEscKeyListener(handler);
  };
}

function releaseEscKeyListener(handler: IHandlerFunction) {
  const index = handlers.findIndex((cb) => cb === handler);

  if (index !== -1) {
    handlers.splice(index, 1);
  }

  if (handlers.length === 0) {
    document.removeEventListener('keydown', handleKeyDown, false);
  }
}
