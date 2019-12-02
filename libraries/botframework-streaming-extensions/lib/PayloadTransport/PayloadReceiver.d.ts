/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TransportDisconnectedEventHandler } from '.';
import { SubscribableStream } from '../SubscribableStream';
import { TransportDisconnectedEventArgs } from './TransportDisconnectedEventArgs';
import { ITransportReceiver } from '../Interfaces/ITransportReceiver';
import { IHeader } from '../Interfaces/IHeader';
export declare class PayloadReceiver {
    isConnected: boolean;
    disconnected: TransportDisconnectedEventHandler;
    private _receiver;
    private _receiveHeaderBuffer;
    private _receivePayloadBuffer;
    private _getStream;
    private _receiveAction;
    connect(receiver: ITransportReceiver): void;
    subscribe(getStream: (header: IHeader) => SubscribableStream, receiveAction: (header: IHeader, stream: SubscribableStream, count: number) => void): void;
    disconnect(e?: TransportDisconnectedEventArgs): void;
    private runReceive;
    private receivePackets;
}
