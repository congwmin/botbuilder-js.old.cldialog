"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CancelDisassembler_1 = require("../Disassemblers/CancelDisassembler");
const HttpContentStreamDisassembler_1 = require("../Disassemblers/HttpContentStreamDisassembler");
const RequestDisassembler_1 = require("../Disassemblers/RequestDisassembler");
const ResponseDisassembler_1 = require("../Disassemblers/ResponseDisassembler");
const PayloadTypes_1 = require("./PayloadTypes");
class SendOperations {
    constructor(payloadSender) {
        this.payloadSender = payloadSender;
    }
    async sendRequest(id, request) {
        let disassembler = new RequestDisassembler_1.RequestDisassembler(this.payloadSender, id, request);
        await disassembler.disassemble();
        if (request.streams) {
            request.streams.forEach(async (contentStream) => {
                await new HttpContentStreamDisassembler_1.HttpContentStreamDisassembler(this.payloadSender, contentStream).disassemble();
            });
        }
    }
    async sendResponse(id, response) {
        let disassembler = new ResponseDisassembler_1.ResponseDisassembler(this.payloadSender, id, response);
        await disassembler.disassemble();
        if (response.streams) {
            response.streams.forEach(async (contentStream) => {
                await new HttpContentStreamDisassembler_1.HttpContentStreamDisassembler(this.payloadSender, contentStream).disassemble();
            });
        }
    }
    async sendCancelStream(id) {
        let disassembler = new CancelDisassembler_1.CancelDisassembler(this.payloadSender, id, PayloadTypes_1.PayloadTypes.cancelStream);
        disassembler.disassemble();
    }
}
exports.SendOperations = SendOperations;
//# sourceMappingURL=SendOperations.js.map