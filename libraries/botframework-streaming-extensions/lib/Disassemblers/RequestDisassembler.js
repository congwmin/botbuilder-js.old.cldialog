"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const PayloadTypes_1 = require("../Payloads/PayloadTypes");
const PayloadDisassembler_1 = require("./PayloadDisassembler");
class RequestDisassembler extends PayloadDisassembler_1.PayloadDisassembler {
    constructor(sender, id, request) {
        super(sender, id);
        this.payloadType = PayloadTypes_1.PayloadTypes.request;
        this.request = request;
    }
    async getStream() {
        let payload = { verb: this.request.verb, path: this.request.path, streams: [] };
        if (this.request.streams) {
            this.request.streams.forEach(function (stream) {
                payload.streams.push(stream.description);
            });
        }
        return PayloadDisassembler_1.PayloadDisassembler.serialize(payload);
    }
}
exports.RequestDisassembler = RequestDisassembler;
//# sourceMappingURL=RequestDisassembler.js.map