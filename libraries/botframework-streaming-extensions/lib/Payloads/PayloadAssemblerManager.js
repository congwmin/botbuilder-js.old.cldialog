"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PayloadAssembler_1 = require("../Assemblers/PayloadAssembler");
const PayloadTypes_1 = require("./PayloadTypes");
class PayloadAssemblerManager {
    constructor(streamManager, onReceiveResponse, onReceiveRequest) {
        this.activeAssemblers = {};
        this.streamManager = streamManager;
        this.onReceiveRequest = onReceiveRequest;
        this.onReceiveResponse = onReceiveResponse;
    }
    getPayloadStream(header) {
        if (header.payloadType === PayloadTypes_1.PayloadTypes.stream) {
            return this.streamManager.getPayloadStream(header);
        }
        else if (!this.activeAssemblers[header.id]) {
            let assembler = this.createPayloadAssembler(header);
            if (assembler) {
                this.activeAssemblers[header.id] = assembler;
                return assembler.getPayloadStream();
            }
        }
    }
    onReceive(header, contentStream, contentLength) {
        if (header.payloadType === PayloadTypes_1.PayloadTypes.stream) {
            this.streamManager.onReceive(header, contentStream, contentLength);
        }
        else {
            if (this.activeAssemblers && this.activeAssemblers[header.id]) {
                let assembler = this.activeAssemblers[header.id];
                assembler.onReceive(header, contentStream, contentLength);
            }
            if (header.end) {
                delete this.activeAssemblers[header.id];
            }
        }
    }
    createPayloadAssembler(header) {
        if (header.payloadType === PayloadTypes_1.PayloadTypes.request) {
            return new PayloadAssembler_1.PayloadAssembler(this.streamManager, { header: header, onCompleted: this.onReceiveRequest });
        }
        else if (header.payloadType === PayloadTypes_1.PayloadTypes.response) {
            return new PayloadAssembler_1.PayloadAssembler(this.streamManager, { header: header, onCompleted: this.onReceiveResponse });
        }
    }
}
exports.PayloadAssemblerManager = PayloadAssemblerManager;
//# sourceMappingURL=PayloadAssemblerManager.js.map