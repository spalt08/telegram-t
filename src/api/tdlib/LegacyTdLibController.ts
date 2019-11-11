import EventEmitter from 'events';

import { TdLibUpdate } from './types';

type TdLibClientUpdate = TdLibUpdate;

class LegacyTdLibController extends EventEmitter {
  // This will be overloaded.
  send: any;

  onUpdate(update: TdLibUpdate) {
    this.emit('update', update);
  }

  clientUpdate(update: TdLibClientUpdate) {
    this.emit('clientUpdate', update);
  }
}

const controller = new LegacyTdLibController();

export default controller;
