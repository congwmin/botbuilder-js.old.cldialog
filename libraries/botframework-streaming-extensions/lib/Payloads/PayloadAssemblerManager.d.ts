/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SubscribableStream } from '../SubscribableStream';
import { StreamManager } from './StreamManager';
import { IHeader } from '../Interfaces/IHeader';
export declare class PayloadAssemblerManager {
    private readonly onReceiveRequest;
    private readonly onReceiveResponse;
    private readonly streamManager;
    private readonly activeAssemblers;
    constructor(streamManager: StreamManager, onReceiveResponse: Function, onReceiveRequest: Function);
    getPayloadStream(header: IHeader): SubscribableStream;
    onReceive(header: IHeader, contentStream: SubscribableStream, contentLength: number): void;
    private createPayloadAssembler;
}
