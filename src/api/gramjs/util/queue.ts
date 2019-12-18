type QueueItem = {
  fn: (...args: any) => any;
  resolve?: Function;
  reject?: Function;
};

export class Queue {
  private queue: QueueItem[] = [];

  add<T extends QueueItem['fn']>(fn: T): ReturnType<T> {
    const item: QueueItem = { fn };

    const promise = new Promise((resolve, reject) => {
      item.resolve = resolve;
      item.reject = reject;
    });

    this.queue.push(item);

    if (this.queue.length === 1) {
      void this.execute();
    }

    return promise as ReturnType<T>;
  }

  private async execute() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const [item] = this.queue;
      if (!item) {
        break;
      }

      const { fn, resolve, reject } = item;
      try {
        const result = await fn();
        resolve!(result);
      } catch (err) {
        reject!(err);
      }

      this.queue.shift();
    }
  }
}
