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
/// <summary>
/// A server for use with the Bot Framework Protocol V3 with Streaming Extensions and an underlying Named Pipe transport.
/// </summary>
class NamedPipeServer {
    /// <summary>
    /// Initializes a new instance of the <see cref="NamedPipeServer"/> class.
    /// </summary>
    /// <param name="baseName">The named pipe to connect to.</param>
    /// <param name="requestHandler">A <see cref="RequestHandler"/> to process incoming messages received by this server.</param>
    /// <param name="autoReconnect">Optional setting to determine if the server sould attempt to reconnect
    /// automatically on disconnection events. Defaults to true.
    /// </param>
    constructor(baseName, requestHandler, autoReconnect = true) {
        this._baseName = baseName;
        this._requestHandler = requestHandler;
        this._autoReconnect = autoReconnect;
        this._requestManager = new Payloads_1.RequestManager();
        this._sender = new PayloadTransport_1.PayloadSender();
        this._receiver = new PayloadTransport_1.PayloadReceiver();
        this._protocolAdapter = new ProtocolAdapter_1.ProtocolAdapter(this._requestHandler, this._requestManager, this._sender, this._receiver);
        this._sender.disconnected = this.onConnectionDisconnected.bind(this);
        this._receiver.disconnected = this.onConnectionDisconnected.bind(this);
    }
    /// <summary>
    /// Used to establish the connection used by this server and begin listening for incoming messages.
    /// </summary>
    /// <returns>A promised string that will not resolve as long as the server is running.</returns>
    async start() {
        if (this._receiver.isConnected || this._sender.isConnected || this._incomingServer || this._outgoingServer) {
            this.disconnect();
        }
        const incoming = new Promise(resolve => {
            this._incomingServer = new net_1.Server((socket) => {
                this._receiver.connect(new NamedPipeTransport_1.NamedPipeTransport(socket));
                resolve();
            });
        });
        const outgoing = new Promise(resolve => {
            this._outgoingServer = new net_1.Server((socket) => {
                this._sender.connect(new NamedPipeTransport_1.NamedPipeTransport(socket));
                resolve();
            });
        });
        await Promise.all([incoming, outgoing]);
        const { PipePath, ServerIncomingPath, ServerOutgoingPath } = NamedPipeTransport_1.NamedPipeTransport;
        const incomingPipeName = PipePath + this._baseName + ServerIncomingPath;
        const outgoingPipeName = PipePath + this._baseName + ServerOutgoingPath;
        this._incomingServer.listen(incomingPipeName);
        this._outgoingServer.listen(outgoingPipeName);
        return 'connected';
    }
    // Allows for manually disconnecting the server.
    disconnect() {
        this._sender.disconnect();
        this._receiver.disconnect();
        if (this._incomingServer) {
            this._incomingServer.close();
            this._incomingServer = null;
        }
        if (this._outgoingServer) {
            this._outgoingServer.close();
            this._outgoingServer = null;
        }
    }
    /// <summary>
    /// Task used to send data over this server connection.
    /// </summary>
    /// <param name="request">The <see cref="StreamingRequest"/> to send.</param>
    /// <param name="cancellationToken">Optional <see cref="CancellationToken"/> used to signal this operation should be cancelled.</param>
    /// <returns>A <see cref="Task"/> of type <see cref="ReceiveResponse"/> handling the send operation.</returns>
    async send(request) {
        return this._protocolAdapter.sendRequest(request);
    }
    onConnectionDisconnected() {
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
                    this.start()
                        .catch((err) => { throw (new Error(`Unable to reconnect: ${err.message}`)); });
                }
            }
            finally {
                this._isDisconnecting = false;
            }
        }
    }
}
exports.NamedPipeServer = NamedPipeServer;
//# sourceMappingURL=NamedPipeServer.js.map