/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ISocket } from '../Interfaces/ISocket';
export declare class BrowserWebSocket implements ISocket {
    private webSocket;
    constructor(socket?: WebSocket);
    connect(serverAddress: string): Promise<void>;
    isConnected(): boolean;
    write(buffer: Buffer): void;
    close(): void;
    setOnMessageHandler(handler: (x: any) => void): void;
    setOnErrorHandler(handler: (x: any) => void): void;
    setOnCloseHandler(handler: (x: any) => void): void;
}
