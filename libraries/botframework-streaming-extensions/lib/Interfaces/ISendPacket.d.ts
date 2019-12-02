/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IHeader } from './IHeader';
import { SubscribableStream } from '../SubscribableStream';
export interface ISendPacket {
    header: IHeader;
    payload: SubscribableStream;
    sentCallback: () => Promise<void>;
}
