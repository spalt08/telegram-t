import { Api } from '..';

import { BotAuthParams, UserAuthParams } from './auth';
import { uploadFile, UploadFileParams } from './uploadFile';

declare class TelegramClient {
    constructor(...args: any)

    async start(authParams: UserAuthParams | BotAuthParams);

    async invoke<R extends Api.AnyRequest>(request: R): Promise<R['__response']>;

    async uploadFile(uploadParams: UploadFileParams): ReturnType<typeof uploadFile>;

    // Untyped methods.
    [prop: string]: any;
}

export default TelegramClient;
