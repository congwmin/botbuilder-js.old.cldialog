/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IReceiveResponse } from '../Interfaces/IReceiveResponse';
export declare class RequestManager {
    private readonly _pendingRequests;
    pendingRequestCount(): number;
    signalResponse(requestId: string, response: IReceiveResponse): Promise<boolean>;
    getResponse(requestId: string): Promise<IReceiveResponse>;
}
