"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const stream_1 = require("stream");
class SubscribableStream extends stream_1.Duplex {
    constructor(options) {
        super(options);
        this.length = 0;
        this.bufferList = [];
    }
    _write(chunk, encoding, callback) {
        let buffer = Buffer.from(chunk);
        this.bufferList.push(buffer);
        this.length += chunk.length;
        if (this._onData) {
            this._onData(buffer);
        }
        callback();
    }
    _read(size) {
        if (this.bufferList.length === 0) {
            // null signals end of stream
            this.push(null);
        }
        else {
            let total = 0;
            while (total < size && this.bufferList.length > 0) {
                let buffer = this.bufferList[0];
                this.push(buffer);
                this.bufferList.splice(0, 1);
                total += buffer.length;
            }
        }
    }
    subscribe(onData) {
        this._onData = onData;
    }
}
exports.SubscribableStream = SubscribableStream;
//# sourceMappingURL=SubscribableStream.js.map