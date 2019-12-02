/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { HttpContent, HttpContentStream } from './HttpContentStream';
export declare class StreamingRequest {
    verb: string;
    path: string;
    streams: HttpContentStream[];
    static create(method: string, path?: string, body?: HttpContent): StreamingRequest;
    addStream(content: HttpContent): void;
    setBody(body: any): void;
}
