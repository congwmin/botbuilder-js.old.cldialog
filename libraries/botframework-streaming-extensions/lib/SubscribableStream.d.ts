/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Duplex, DuplexOptions } from 'stream';
export declare class SubscribableStream extends Duplex {
    length: number;
    private readonly bufferList;
    private _onData;
    constructor(options?: DuplexOptions);
    _write(chunk: any, encoding: string, callback: (error?: Error | null) => void): void;
    _read(size: number): void;
    subscribe(onData: (chunk: any) => void): void;
}
