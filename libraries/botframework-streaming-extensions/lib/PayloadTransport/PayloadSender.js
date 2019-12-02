"use strict";
/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const HeaderSerializer_1 = require("../Payloads/HeaderSerializer");
const PayloadConstants_1 = require("../Payloads/PayloadConstants");
const TransportDisconnectedEventArgs_1 = require("./TransportDisconnectedEventArgs");
class PayloadSender {
    /// <summary>
    /// Returns true if connected to a transport sender.
    /// </summary>
    get isConnected() {
        return !!this.sender;
    }
    /// <summary>
    /// Connects to the given transport sender.
    /// </summary>
    /// <param name="sender">The transport sender to connect this payload sender to.</param>
    connect(sender) {
        this.sender = sender;
    }
    /// <summary>
    /// Sends a payload out over the connected transport sender.
    /// </summary>
    /// <param name="header">The header to attach to the outgoing payload.</param>
    /// <param name="payload">The stream of buffered data to send.</param>
    /// <param name="sentCalback">The function to execute when the send has completed.</param>
    sendPayload(header, payload, sentCallback) {
        var packet = { header, payload, sentCallback };
        this.writePacket(packet);
    }
    /// <summary>
    /// Disconnects this payload sender.
    /// </summary>
    /// <param name="e">The disconnected event arguments to include in the disconnected event broadcast.</param>
    disconnect(e) {
        if (this.isConnected) {
            this.sender.close();
            this.sender = null;
            if (this.disconnected) {
                this.disconnected(this, e || TransportDisconnectedEventArgs_1.TransportDisconnectedEventArgs.Empty);
            }
        }
    }
    writePacket(packet) {
        try {
            let sendHeaderBuffer = Buffer.alloc(PayloadConstants_1.PayloadConstants.MaxHeaderLength);
            HeaderSerializer_1.HeaderSerializer.serialize(packet.header, sendHeaderBuffer);
            this.sender.send(sendHeaderBuffer);
            if (packet.header.payloadLength > 0 && packet.payload) {
                let count = packet.header.payloadLength;
                while (count > 0) {
                    let chunk = packet.payload.read(count);
                    this.sender.send(chunk);
                    count -= chunk.length;
                }
                if (packet.sentCallback) {
                    packet.sentCallback();
                }
            }
        }
        catch (e) {
            this.disconnect(new TransportDisconnectedEventArgs_1.TransportDisconnectedEventArgs(e.message));
        }
    }
}
exports.PayloadSender = PayloadSender;
//# sourceMappingURL=PayloadSender.js.map