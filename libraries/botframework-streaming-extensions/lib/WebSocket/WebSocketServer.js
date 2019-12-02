"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const ProtocolAdapter_1 = require("../ProtocolAdapter");
const Payloads_1 = require("../Payloads");
const PayloadTransport_1 = require("../PayloadTransport");
const WebSocketTransport_1 = require("./WebSocketTransport");
/// <summary>
/// A server for use with the Bot Framework Protocol V3 with Streaming Extensions and an underlying WebSocket transport.
/// </summary>
class WebSocketServer {
    /// <summary>
    /// Initializes a new instance of the <see cref="WebSocketServer"/> class.
    /// </summary>
    /// <param name="socket">The <see cref="ISocket"/> of the underlying connection for this server to be built on top of.</param>
    /// <param name="requestHandler">A <see cref="RequestHandler"/> to process incoming messages received by this server.</param>
    constructor(socket, requestHandler) {
        this._webSocketTransport = new WebSocketTransport_1.WebSocketTransport(socket);
        this._requestHandler = requestHandler;
        this._requestManager = new Payloads_1.RequestManager();
        this._sender = new PayloadTransport_1.PayloadSender();
        this._sender.disconnected = this.onConnectionDisconnected.bind(this);
        this._receiver = new PayloadTransport_1.PayloadReceiver();
        this._receiver.disconnected = this.onConnectionDisconnected.bind(this);
        this._protocolAdapter = new ProtocolAdapter_1.ProtocolAdapter(this._requestHandler, this._requestManager, this._sender, this._receiver);
        this._closedSignal = (x) => { return x; };
    }
    /// <summary>
    /// Used to establish the connection used by this server and begin listening for incoming messages.
    /// </summary>
    /// <returns>A promise to handle the server listen operation. This task will not resolve as long as the server is running.</returns>
    async start() {
        this._sender.connect(this._webSocketTransport);
        this._receiver.connect(this._webSocketTransport);
        return this._closedSignal;
    }
    /// <summary>
    /// Used to send data over this server connection.
    /// </summary>
    /// <param name="request">The <see cref="StreamingRequest"/> to send.</param>
    /// <returns>A promise of type <see cref="ReceiveResponse"/> handling the send operation.</returns>
    async send(request) {
        return this._protocolAdapter.sendRequest(request);
    }
    /// <summary>
    /// Stop this server.
    /// </summary>
    disconnect() {
        this._sender.disconnect(new PayloadTransport_1.TransportDisconnectedEventArgs('Disconnect was called.'));
        this._receiver.disconnect(new PayloadTransport_1.TransportDisconnectedEventArgs('Disconnect was called.'));
    }
    onConnectionDisconnected(s, sender, args) {
        s._closedSignal('close');
    }
}
exports.WebSocketServer = WebSocketServer;
//# sourceMappingURL=WebSocketServer.js.map