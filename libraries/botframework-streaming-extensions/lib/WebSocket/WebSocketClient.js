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
const BrowserWebSocket_1 = require("./BrowserWebSocket");
const NodeWebSocket_1 = require("./NodeWebSocket");
const WebSocketTransport_1 = require("./WebSocketTransport");
/// <summary>
/// A client for use with the Bot Framework Protocol V3 with Streaming Extensions and an underlying WebSocket transport.
/// </summary>
class WebSocketClient {
    /// <summary>
    /// Initializes a new instance of the <see cref="WebSocketClient"/> class.
    /// </summary>
    /// <param name="url">The URL of the remote server to connect to.</param>
    /// <param name="requestHandler">Optional <see cref="RequestHandler"/> to process incoming messages received by this server.</param>
    /// <param name="autoReconnect">Optional setting to determine if the server sould attempt to reconnect
    /// automatically on disconnection events. Defaults to true.
    /// </param>
    constructor({ url, requestHandler, autoReconnect = true }) {
        this._url = url;
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
    /// <returns>A promise that will not resolve until the client stops listening for incoming messages.</returns>
    async connect() {
        if (typeof WebSocket !== 'undefined') {
            const ws = new BrowserWebSocket_1.BrowserWebSocket();
            await ws.connect(this._url);
            const transport = new WebSocketTransport_1.WebSocketTransport(ws);
            this._sender.connect(transport);
            this._receiver.connect(transport);
        }
        else {
            const ws = new NodeWebSocket_1.NodeWebSocket();
            try {
                await ws.connect(this._url);
                const transport = new WebSocketTransport_1.WebSocketTransport(ws);
                this._sender.connect(transport);
                this._receiver.connect(transport);
            }
            catch (error) {
                throw (new Error(`Unable to connect client to Node transport.`));
            }
        }
    }
    /// <summary>
    /// Stop this client from listening.
    /// </summary>
    disconnect() {
        this._sender.disconnect(new PayloadTransport_1.TransportDisconnectedEventArgs('Disconnect was called.'));
        this._receiver.disconnect(new PayloadTransport_1.TransportDisconnectedEventArgs('Disconnect was called.'));
    }
    /// <summary>
    /// Task used to send data over this client connection.
    /// </summary>
    /// <param name="request">The <see cref="StreamingRequest"/> to send.</param>
    /// <returns>A promise that will produce an instance of <see cref="ReceiveResponse"/> on completion of the send operation.</returns>
    async send(request) {
        return this._protocolAdapter.sendRequest(request);
    }
    onConnectionDisconnected(sender, args) {
        if (this._autoReconnect) {
            this.connect()
                .catch(() => { throw (new Error(`Unable to re-connect client to Node transport. Sender:` + sender + ' Args:' + args)); });
        }
    }
}
exports.WebSocketClient = WebSocketClient;
//# sourceMappingURL=WebSocketClient.js.map