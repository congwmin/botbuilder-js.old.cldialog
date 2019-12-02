/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PayloadSender } from '../PayloadTransport/PayloadSender';
import { StreamingRequest } from '../StreamingRequest';
import { StreamingResponse } from '../StreamingResponse';
export declare class SendOperations {
    private readonly payloadSender;
    constructor(payloadSender: PayloadSender);
    sendRequest(id: string, request: StreamingRequest): Promise<void>;
    sendResponse(id: string, response: StreamingResponse): Promise<void>;
    sendCancelStream(id: string): Promise<void>;
}
