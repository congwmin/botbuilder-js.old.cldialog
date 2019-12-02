/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SubscribableStream } from '../SubscribableStream';
import { TransportDisconnectedEventArgs } from './TransportDisconnectedEventArgs';
import { TransportDisconnectedEventHandler } from './TransportDisconnectedEventHandler';
import { ITransportSender } from '../Interfaces/ITransportSender';
import { IHeader } from '../Interfaces/IHeader';
export declare class PayloadSender {
    disconnected?: TransportDisconnectedEventHandler;
    private sender;
    readonly isConnected: boolean;
    connect(sender: ITransportSender): void;
    sendPayload(header: IHeader, payload?: SubscribableStream, sentCallback?: () => Promise<void>): void;
    disconnect(e?: TransportDisconnectedEventArgs): void;
    private writePacket;
}
