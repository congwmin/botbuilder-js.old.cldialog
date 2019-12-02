/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IHeader } from '../Interfaces/IHeader';
import { SubscribableStream } from '../SubscribableStream';
import { PayloadAssembler } from '../Assemblers/PayloadAssembler';
export declare class StreamManager {
    private readonly activeAssemblers;
    private readonly onCancelStream;
    constructor(onCancelStream: Function);
    getPayloadAssembler(id: string): PayloadAssembler;
    getPayloadStream(header: IHeader): SubscribableStream;
    onReceive(header: IHeader, contentStream: SubscribableStream, contentLength: number): void;
    closeStream(id: string): void;
}
