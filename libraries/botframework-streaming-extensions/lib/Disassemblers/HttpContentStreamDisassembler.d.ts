/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { HttpContentStream } from '../HttpContentStream';
import { PayloadSender } from '../PayloadTransport/PayloadSender';
import { PayloadTypes } from '../Payloads/PayloadTypes';
import { PayloadDisassembler } from './PayloadDisassembler';
import { IStreamWrapper } from '../Interfaces/IStreamWrapper';
export declare class HttpContentStreamDisassembler extends PayloadDisassembler {
    readonly contentStream: HttpContentStream;
    payloadType: PayloadTypes;
    constructor(sender: PayloadSender, contentStream: HttpContentStream);
    getStream(): Promise<IStreamWrapper>;
}
