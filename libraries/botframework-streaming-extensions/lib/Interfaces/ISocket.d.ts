/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export interface ISocket {
    isConnected(): boolean;
    write(buffer: Buffer): any;
    connect(serverAddress: string): Promise<void>;
    close(): any;
    setOnMessageHandler(handler: (x: any) => void): any;
    setOnErrorHandler(handler: (x: any) => void): any;
    setOnCloseHandler(handler: (x: any) => void): any;
}
