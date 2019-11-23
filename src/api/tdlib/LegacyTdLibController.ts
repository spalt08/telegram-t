import EventEmitter from 'events';

import { ApiUpdate } from '../types';

type TdLibClientUpdate = ApiUpdate;

class LegacyTdLibController extends EventEmitter {
  // This will be overloaded.
  send: any;

  onUpdate(update: ApiUpdate) {
    this.emit('update', update);
  }

  clientUpdate(update: TdLibClientUpdate) {
    this.emit('clientUpdate', update);
  }
}

const controller = new LegacyTdLibController();

export default controller;
