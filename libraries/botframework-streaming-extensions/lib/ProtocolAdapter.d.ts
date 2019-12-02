/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PayloadAssembler } from './Assemblers/PayloadAssembler';
import { RequestManager } from './Payloads/RequestManager';
import { PayloadReceiver } from './PayloadTransport/PayloadReceiver';
import { PayloadSender } from './PayloadTransport/PayloadSender';
import { RequestHandler } from './RequestHandler';
import { StreamingRequest } from './StreamingRequest';
import { IReceiveResponse, IReceiveRequest } from './Interfaces';
export declare class ProtocolAdapter {
    private readonly requestHandler;
    private readonly payloadSender;
    private readonly payloadReceiver;
    private readonly requestManager;
    private readonly sendOperations;
    private readonly streamManager;
    private readonly assemblerManager;
    constructor(requestHandler: RequestHandler, requestManager: RequestManager, sender: PayloadSender, receiver: PayloadReceiver);
    sendRequest(request: StreamingRequest): Promise<IReceiveResponse>;
    onReceiveRequest(id: string, request: IReceiveRequest): Promise<void>;
    onReceiveResponse(id: string, response: IReceiveResponse): Promise<void>;
    onCancelStream(contentStreamAssembler: PayloadAssembler): void;
}
