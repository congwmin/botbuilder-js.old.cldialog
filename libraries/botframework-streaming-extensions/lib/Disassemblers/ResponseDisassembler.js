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
class ResponseDisassembler extends PayloadDisassembler_1.PayloadDisassembler {
    constructor(sender, id, response) {
        super(sender, id);
        this.payloadType = PayloadTypes_1.PayloadTypes.response;
        this.response = response;
    }
    async getStream() {
        let payload = { statusCode: this.response.statusCode, streams: [] };
        if (this.response.streams) {
            this.response.streams.forEach(function (stream) {
                payload.streams.push(stream.description);
            });
        }
        return PayloadDisassembler_1.PayloadDisassembler.serialize(payload);
    }
}
exports.ResponseDisassembler = ResponseDisassembler;
//# sourceMappingURL=ResponseDisassembler.js.map