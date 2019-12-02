/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Socket } from 'net';
import { ITransportSender } from '../Interfaces/ITransportSender';
import { ITransportReceiver } from '../Interfaces/ITransportReceiver';
export declare class NamedPipeTransport implements ITransportSender, ITransportReceiver {
    static readonly PipePath: string;
    static readonly ServerIncomingPath: string;
    static readonly ServerOutgoingPath: string;
    private _socket;
    private readonly _queue;
    private _active;
    private _activeOffset;
    private _activeReceiveResolve;
    private _activeReceiveReject;
    private _activeReceiveCount;
    constructor(socket: Socket);
    send(buffer: Buffer): number;
    isConnected(): boolean;
    close(): void;
    receive(count: number): Promise<Buffer>;
    private socketReceive;
    private socketClose;
    private socketError;
    private trySignalData;
}
