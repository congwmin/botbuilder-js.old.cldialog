/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SubscribableStream } from '../SubscribableStream';
import { StreamManager } from '../Payloads';
import { IAssemblerParams } from '../Interfaces/IAssemblerParams';
import { IHeader } from '../Interfaces/IHeader';
export declare class PayloadAssembler {
    id: string;
    end: boolean;
    contentLength: number;
    payloadType: string;
    private stream;
    private readonly _onCompleted;
    private readonly _streamManager;
    private readonly _byteOrderMark;
    private readonly _utf;
    constructor(streamManager: StreamManager, params: IAssemblerParams);
    getPayloadStream(): SubscribableStream;
    onReceive(header: IHeader, stream: SubscribableStream, contentLength: number): void;
    close(): void;
    private createPayloadStream;
    private payloadFromJson;
    private stripBOM;
    private process;
    private processResponse;
    private processRequest;
    private processStreams;
}
