import { Api } from '..';

declare class TelegramClient {
    constructor(...args: any)

    async invoke<R extends Api.AnyRequest>(request: R): Promise<R['__response']>;

    [prop: string]: any;
}

export default TelegramClient;
