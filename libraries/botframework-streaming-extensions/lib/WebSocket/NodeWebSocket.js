"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const http = require("http");
const WaterShed = require("watershed");
class NodeWebSocket {
    /// <summary>
    /// Creates a new instance of the NodeWebSocket class.
    /// </summary>
    /// <param name="waterShedSocket">The WaterShed socket object to build this connection on.</param>
    constructor(waterShedSocket) {
        this.waterShedSocket = waterShedSocket;
        this.connected = !!waterShedSocket;
    }
    /// <summary>
    /// True if the socket is currently connected.
    /// </summary>
    isConnected() {
        return this.connected;
    }
    /// <summary>
    /// Writes a buffer to the socket and sends it.
    /// </summary>
    /// <param name="buffer">The buffer of data to send across the connection.</param>
    write(buffer) {
        this.waterShedSocket.send(buffer);
    }
    /// <summary>
    /// Connects to the supporting socket using WebSocket protocol.
    /// </summary>
    /// <param name="serverAddress">The address the server is listening on.</param>
    /// <param name="port">The port the server is listening on, defaults to 8082.</param>
    async connect(serverAddress, port = 8082) {
        // following template from https://github.com/joyent/node-watershed#readme
        let shed = new WaterShed.Watershed();
        let wskey = shed.generateKey();
        let options = {
            port: port,
            hostname: serverAddress,
            headers: {
                connection: 'upgrade',
                'Sec-WebSocket-Key': wskey,
                'Sec-WebSocket-Version': '13'
            }
        };
        let req = http.request(options);
        req.end();
        req.on('upgrade', function (res, socket, head) {
            shed.connect(res, socket, head, wskey);
        });
        this.connected = true;
        return new Promise((resolve, reject) => {
            req.on('close', resolve);
            req.on('error', reject);
        });
    }
    /// <summary>
    /// Set the handler for text and binary messages received on the socket.
    /// </summary>
    setOnMessageHandler(handler) {
        this.waterShedSocket.on('text', handler);
        this.waterShedSocket.on('binary', handler);
    }
    /// <summary>
    /// Close the socket.
    /// </summary>
    close() {
        this.connected = false;
        return this.waterShedSocket.end();
    }
    /// <summary>
    /// Set the callback to call when encountering socket closures.
    /// </summary>
    setOnCloseHandler(handler) {
        this.waterShedSocket.on('end', handler);
    }
    /// <summary>
    /// Set the callback to call when encountering errors.
    /// </summary>
    setOnErrorHandler(handler) {
        this.waterShedSocket.on('error', (error) => { if (error) {
            handler(error);
        } });
    }
}
exports.NodeWebSocket = NodeWebSocket;
//# sourceMappingURL=NodeWebSocket.js.map