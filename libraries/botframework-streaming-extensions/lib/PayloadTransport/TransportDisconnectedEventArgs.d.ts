/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export declare class TransportDisconnectedEventArgs {
    static Empty: TransportDisconnectedEventArgs;
    reason: string;
    constructor(reason?: string);
}
