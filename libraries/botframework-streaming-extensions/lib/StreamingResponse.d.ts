/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { HttpContent, HttpContentStream } from './HttpContentStream';
export declare class StreamingResponse {
    statusCode: number;
    streams: HttpContentStream[];
    static create(statusCode: number, body?: HttpContent): StreamingResponse;
    addStream(content: HttpContent): void;
    setBody(body: any): void;
}
