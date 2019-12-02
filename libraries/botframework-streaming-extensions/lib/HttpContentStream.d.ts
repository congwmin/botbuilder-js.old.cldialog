/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SubscribableStream } from './SubscribableStream';
import { IHttpContentHeaders } from './Interfaces/IHttpContentHeaders';
export declare class HttpContentStream {
    readonly id: string;
    readonly content: HttpContent;
    description: {
        id: string;
        type: string;
        length: number;
    };
    constructor(content: HttpContent);
}
export declare class HttpContent {
    headers: IHttpContentHeaders;
    private readonly stream;
    constructor(headers: IHttpContentHeaders, stream: SubscribableStream);
    getStream(): SubscribableStream;
}
