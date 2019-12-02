/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IReceiveRequest } from './Interfaces/IReceiveRequest';
import { StreamingResponse } from './StreamingResponse';
export declare abstract class RequestHandler {
    abstract processRequest(request: IReceiveRequest, logger?: any): Promise<StreamingResponse>;
}
