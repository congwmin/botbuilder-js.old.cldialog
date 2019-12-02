/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PayloadTypes } from '../Payloads/PayloadTypes';
import { PayloadSender } from '../PayloadTransport/PayloadSender';
import { StreamingRequest } from '../StreamingRequest';
import { PayloadDisassembler } from './PayloadDisassembler';
import { IStreamWrapper } from '../Interfaces/IStreamWrapper';
export declare class RequestDisassembler extends PayloadDisassembler {
    request: StreamingRequest;
    payloadType: PayloadTypes;
    constructor(sender: PayloadSender, id: string, request?: StreamingRequest);
    getStream(): Promise<IStreamWrapper>;
}
