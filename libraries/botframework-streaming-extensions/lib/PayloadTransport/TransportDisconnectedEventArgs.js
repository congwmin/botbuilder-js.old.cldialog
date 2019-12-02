"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
class TransportDisconnectedEventArgs {
    constructor(reason) {
        this.reason = reason;
    }
}
TransportDisconnectedEventArgs.Empty = new TransportDisconnectedEventArgs();
exports.TransportDisconnectedEventArgs = TransportDisconnectedEventArgs;
//# sourceMappingURL=TransportDisconnectedEventArgs.js.map