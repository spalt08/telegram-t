import { Api } from '..';
import { BotAuthParams, UserAuthParams } from './auth';

declare class TelegramClient {
    constructor(...args: any)

    async start(authParams: UserAuthParams | BotAuthParams);
    async invoke<R extends Api.AnyRequest>(request: R): Promise<R['__response']>;

    [prop: string]: any;
}

export default TelegramClient;
