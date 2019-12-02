/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IReceiveResponse } from './IReceiveResponse';
import { StreamingRequest } from '../StreamingRequest';
export interface IStreamingTransportClient {
    connect(): Promise<void>;
    disconnect(): void;
    send(request: StreamingRequest): Promise<IReceiveResponse>;
}
