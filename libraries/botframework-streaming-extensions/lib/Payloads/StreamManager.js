"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PayloadAssembler_1 = require("../Assemblers/PayloadAssembler");
class StreamManager {
    constructor(onCancelStream) {
        this.activeAssemblers = [];
        this.onCancelStream = onCancelStream;
    }
    getPayloadAssembler(id) {
        if (!this.activeAssemblers[id]) {
            // A new id has come in, kick off the process of tracking it.
            let assembler = new PayloadAssembler_1.PayloadAssembler(this, { id: id });
            this.activeAssemblers[id] = assembler;
            return assembler;
        }
        else {
            return this.activeAssemblers[id];
        }
    }
    getPayloadStream(header) {
        let assembler = this.getPayloadAssembler(header.id);
        return assembler.getPayloadStream();
    }
    onReceive(header, contentStream, contentLength) {
        if (!this.activeAssemblers[header.id]) {
            return;
        }
        this.activeAssemblers[header.id].onReceive(header, contentStream, contentLength);
    }
    closeStream(id) {
        if (!this.activeAssemblers[id]) {
            return;
        }
        else {
            let assembler = this.activeAssemblers[id];
            this.activeAssemblers.splice(this.activeAssemblers.indexOf(id), 1);
            let targetStream = assembler.getPayloadStream();
            if ((assembler.contentLength && targetStream.length < assembler.contentLength) || !assembler.end) {
                this.onCancelStream(assembler);
            }
        }
    }
}
exports.StreamManager = StreamManager;
//# sourceMappingURL=StreamManager.js.map