/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PayloadTypes } from '../Payloads/PayloadTypes';
import { PayloadSender } from '../PayloadTransport/PayloadSender';
import { StreamingResponse } from '../StreamingResponse';
import { PayloadDisassembler } from './PayloadDisassembler';
import { IStreamWrapper } from '../Interfaces/IStreamWrapper';
export declare class ResponseDisassembler extends PayloadDisassembler {
    readonly response: StreamingResponse;
    readonly payloadType: PayloadTypes;
    constructor(sender: PayloadSender, id: string, response: StreamingResponse);
    getStream(): Promise<IStreamWrapper>;
}
