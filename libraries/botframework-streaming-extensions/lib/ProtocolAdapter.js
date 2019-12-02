"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PayloadAssemblerManager_1 = require("./Payloads/PayloadAssemblerManager");
const SendOperations_1 = require("./Payloads/SendOperations");
const StreamManager_1 = require("./Payloads/StreamManager");
const protocol_base_1 = require("./Utilities/protocol-base");
class ProtocolAdapter {
    /// <summary>
    /// Creates a new instance of the protocol adapter class.
    /// </summary>
    /// <param name="requestHandler">The handler that will process incoming requests.</param>
    /// <param name="requestManager">The manager that will process outgoing requests.</param>
    /// <param name="sender">The sender for use with outgoing requests.</param>
    /// <param name="receiver">The receiver for use with incoming requests.</param>
    constructor(requestHandler, requestManager, sender, receiver) {
        this.requestHandler = requestHandler;
        this.requestManager = requestManager;
        this.payloadSender = sender;
        this.payloadReceiver = receiver;
        this.sendOperations = new SendOperations_1.SendOperations(this.payloadSender);
        this.streamManager = new StreamManager_1.StreamManager(this.onCancelStream);
        this.assemblerManager = new PayloadAssemblerManager_1.PayloadAssemblerManager(this.streamManager, (id, response) => this.onReceiveResponse(id, response), (id, request) => this.onReceiveRequest(id, request));
        this.payloadReceiver.subscribe((header) => this.assemblerManager.getPayloadStream(header), (header, contentStream, contentLength) => this.assemblerManager.onReceive(header, contentStream, contentLength));
    }
    /// <summary>
    /// Sends a request over the attached request manager.
    /// </summary>
    /// <param name="request">The outgoing request to send.</param>
    /// <param name="cancellationToken">Optional cancellation token.</param>
    async sendRequest(request) {
        let requestId = protocol_base_1.generateGuid();
        await this.sendOperations.sendRequest(requestId, request);
        return this.requestManager.getResponse(requestId);
    }
    /// <summary>
    /// Executes the receive pipeline when a request comes in.
    /// </summary>
    /// <param name="id">The id the resources created for the response will be assigned.</param>
    /// <param name="request">The incoming request to process.</param>
    async onReceiveRequest(id, request) {
        if (this.requestHandler) {
            let response = await this.requestHandler.processRequest(request);
            if (response) {
                await this.sendOperations.sendResponse(id, response);
            }
        }
    }
    /// <summary>
    /// Executes the receive pipeline when a response comes in.
    /// </summary>
    /// <param name="id">The id the resources created for the response will be assigned.</param>
    /// <param name="response">The incoming response to process.</param>
    async onReceiveResponse(id, response) {
        await this.requestManager.signalResponse(id, response);
    }
    /// <summary>
    /// Executes the receive pipeline when a cancellation comes in.
    /// </summary>
    /// <param name="contentStreamAssembler">
    /// The payload assembler processing the incoming data that this
    /// cancellation request targets.
    /// </param>
    onCancelStream(contentStreamAssembler) {
        this.sendOperations.sendCancelStream(contentStreamAssembler.id)
            .catch();
    }
}
exports.ProtocolAdapter = ProtocolAdapter;
//# sourceMappingURL=ProtocolAdapter.js.map