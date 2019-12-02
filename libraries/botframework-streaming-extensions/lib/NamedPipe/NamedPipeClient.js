"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const net_1 = require("net");
const ProtocolAdapter_1 = require("../ProtocolAdapter");
const Payloads_1 = require("../Payloads");
const PayloadTransport_1 = require("../PayloadTransport");
const NamedPipeTransport_1 = require("./NamedPipeTransport");
class NamedPipeClient {
    /// <summary>
    /// Initializes a new instance of the <see cref="NamedPipeClient"/> class.
    /// </summary>
    /// <param name="baseName">The named pipe to connect to.</param>
    /// <param name="requestHandler">Optional <see cref="RequestHandler"/> to process incoming messages received by this client.</param>
    /// <param name="autoReconnect">Optional setting to determine if the client sould attempt to reconnect
    /// automatically on disconnection events. Defaults to true.
    /// </param>
    constructor(baseName, requestHandler, autoReconnect = true) {
        this._baseName = baseName;
        this._requestHandler = requestHandler;
        this._autoReconnect = autoReconnect;
        this._requestManager = new Payloads_1.RequestManager();
        this._sender = new PayloadTransport_1.PayloadSender();
        this._sender.disconnected = this.onConnectionDisconnected.bind(this);
        this._receiver = new PayloadTransport_1.PayloadReceiver();
        this._receiver.disconnected = this.onConnectionDisconnected.bind(this);
        this._protocolAdapter = new ProtocolAdapter_1.ProtocolAdapter(this._requestHandler, this._requestManager, this._sender, this._receiver);
    }
    /// <summary>
    /// Establish a connection with no custom headers.
    /// </summary>
    async connect() {
        let outgoingPipeName = NamedPipeTransport_1.NamedPipeTransport.PipePath + this._baseName + NamedPipeTransport_1.NamedPipeTransport.ServerIncomingPath;
        let outgoing = net_1.connect(outgoingPipeName);
        let incomingPipeName = NamedPipeTransport_1.NamedPipeTransport.PipePath + this._baseName + NamedPipeTransport_1.NamedPipeTransport.ServerOutgoingPath;
        let incoming = net_1.connect(incomingPipeName);
        this._sender.connect(new NamedPipeTransport_1.NamedPipeTransport(outgoing));
        this._receiver.connect(new NamedPipeTransport_1.NamedPipeTransport(incoming));
    }
    /// <summary>
    /// Method used to disconnect this client.
    /// </summary>
    disconnect() {
        this._sender.disconnect();
        this._receiver.disconnect();
    }
    /// <summary>
    /// Task used to send data over this client connection.
    /// </summary>
    /// <param name="request">The <see cref="StreamingRequest"/> to send.</param>
    /// <returns>A <see cref="Task"/> that will produce an instance of <see cref="ReceiveResponse"/> on completion of the send operation.</returns>
    async send(request) {
        return this._protocolAdapter.sendRequest(request);
    }
    onConnectionDisconnected(sender, args) {
        if (!this._isDisconnecting) {
            this._isDisconnecting = true;
            try {
                if (this._sender.isConnected) {
                    this._sender.disconnect();
                }
                if (this._receiver.isConnected) {
                    this._receiver.disconnect();
                }
                if (this._autoReconnect) {
                    this.connect()
                        .then(() => { })
                        .catch((error) => { throw new Error(`Failed to reconnect. Reason: ${error.message} Sender: ${sender} Args: ${args}. `); });
                }
            }
            finally {
                this._isDisconnecting = false;
            }
        }
    }
}
exports.NamedPipeClient = NamedPipeClient;
//# sourceMappingURL=NamedPipeClient.js.map