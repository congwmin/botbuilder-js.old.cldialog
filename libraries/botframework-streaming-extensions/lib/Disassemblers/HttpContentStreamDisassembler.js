"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PayloadTypes_1 = require("../Payloads/PayloadTypes");
const PayloadDisassembler_1 = require("./PayloadDisassembler");
class HttpContentStreamDisassembler extends PayloadDisassembler_1.PayloadDisassembler {
    constructor(sender, contentStream) {
        super(sender, contentStream.id);
        this.payloadType = PayloadTypes_1.PayloadTypes.stream;
        this.contentStream = contentStream;
    }
    async getStream() {
        let stream = this.contentStream.content.getStream();
        return { stream, streamLength: stream.length };
    }
}
exports.HttpContentStreamDisassembler = HttpContentStreamDisassembler;
//# sourceMappingURL=HttpContentStreamDisassembler.js.map