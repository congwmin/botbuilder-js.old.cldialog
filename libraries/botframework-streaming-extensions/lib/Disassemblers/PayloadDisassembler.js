"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SubscribableStream_1 = require("../SubscribableStream");
class PayloadDisassembler {
    constructor(sender, id) {
        this.sender = sender;
        this.id = id;
    }
    static serialize(item) {
        let stream = new SubscribableStream_1.SubscribableStream();
        stream.write(JSON.stringify(item));
        stream.end();
        return { stream, streamLength: stream.length };
    }
    async disassemble() {
        let { stream, streamLength } = await this.getStream();
        this.stream = stream;
        this.streamLength = streamLength;
        return this.send();
    }
    async send() {
        let header = { payloadType: this.payloadType, payloadLength: this.streamLength, id: this.id, end: true };
        this.sender.sendPayload(header, this.stream);
    }
}
exports.PayloadDisassembler = PayloadDisassembler;
//# sourceMappingURL=PayloadDisassembler.js.map