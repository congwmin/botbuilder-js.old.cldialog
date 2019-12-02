/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ISocket } from '../Interfaces';
import { ITransportSender } from '../Interfaces/ITransportSender';
import { ITransportReceiver } from '../Interfaces/ITransportReceiver';
export declare class WebSocketTransport implements ITransportSender, ITransportReceiver {
    private _socket;
    private readonly _queue;
    private _active;
    private _activeOffset;
    private _activeReceiveResolve;
    private _activeReceiveReject;
    private _activeReceiveCount;
    constructor(ws: ISocket);
    send(buffer: Buffer): number;
    isConnected(): boolean;
    close(): void;
    receive(count: number): Promise<Buffer>;
    onReceive(data: Buffer): void;
    private onClose;
    private onError;
    private trySignalData;
}
