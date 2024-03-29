"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CancelDisassembler {
    constructor(sender, id, payloadType) {
        this.sender = sender;
        this.id = id;
        this.payloadType = payloadType;
    }
    disassemble() {
        const header = { payloadType: this.payloadType, payloadLength: 0, id: this.id, end: true };
        this.sender.sendPayload(header);
    }
}
exports.CancelDisassembler = CancelDisassembler;
//# sourceMappingURL=CancelDisassembler.js.map