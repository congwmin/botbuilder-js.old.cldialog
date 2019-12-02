/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SubscribableStream } from './SubscribableStream';
import { PayloadAssembler } from './Assemblers';
export declare class ContentStream {
    id: string;
    private readonly assembler;
    private stream;
    constructor(id: string, assembler: PayloadAssembler);
    readonly contentType: string;
    readonly length: number;
    getStream(): SubscribableStream;
    cancel(): void;
    readAsString(): Promise<string>;
    readAsJson<T>(): Promise<T>;
    private readAll;
}
