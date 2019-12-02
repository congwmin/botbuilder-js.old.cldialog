"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PayloadTypes_1 = require("../Payloads/PayloadTypes");
const HeaderSerializer_1 = require("../Payloads/HeaderSerializer");
const PayloadConstants_1 = require("../Payloads/PayloadConstants");
const TransportDisconnectedEventArgs_1 = require("./TransportDisconnectedEventArgs");
class PayloadReceiver {
    constructor() {
        this.disconnected = function (sender, events) { };
    }
    /// <summary>
    /// Creates a new instance of the PayloadReceiver class.
    /// </summary>
    /// <param name="receiver">The ITransportReceiver object to pull incoming data from.</param>
    connect(receiver) {
        if (this.isConnected) {
            throw new Error('Already connected.');
        }
        else {
            this._receiver = receiver;
            this.isConnected = true;
            this.runReceive();
        }
    }
    /// <summary>
    /// Allows subscribing to this receiver in order to be notified when new data comes in.
    /// </summary>
    /// <param name="getStream">Callback when a new stream has been received.</param>
    /// <param name="receiveAction">Callback when a new message has been received.</param>
    subscribe(getStream, receiveAction) {
        this._getStream = getStream;
        this._receiveAction = receiveAction;
    }
    /// <summary>
    /// Force this receiver to disconnect.
    /// </summary>
    /// <param name="e">Event arguments to include when broadcasting disconnection event.</param>
    disconnect(e) {
        let didDisconnect;
        try {
            if (this.isConnected) {
                this._receiver.close();
                didDisconnect = true;
                this.isConnected = false;
            }
        }
        catch (error) {
            this.isConnected = false;
            this.disconnected(error.message, e);
        }
        this._receiver = null;
        this.isConnected = false;
        if (didDisconnect) {
            this.disconnected(this, e || TransportDisconnectedEventArgs_1.TransportDisconnectedEventArgs.Empty);
        }
    }
    runReceive() {
        this.receivePackets()
            .catch();
    }
    async receivePackets() {
        let isClosed;
        while (this.isConnected && !isClosed) {
            try {
                let readSoFar = 0;
                while (readSoFar < PayloadConstants_1.PayloadConstants.MaxHeaderLength) {
                    this._receiveHeaderBuffer = await this._receiver.receive(PayloadConstants_1.PayloadConstants.MaxHeaderLength - readSoFar);
                    if (this._receiveHeaderBuffer) {
                        readSoFar += this._receiveHeaderBuffer.length;
                    }
                }
                let header = HeaderSerializer_1.HeaderSerializer.deserialize(this._receiveHeaderBuffer);
                let isStream = header.payloadType === PayloadTypes_1.PayloadTypes.stream;
                if (header.payloadLength > 0) {
                    let bytesActuallyRead = 0;
                    let contentStream = this._getStream(header);
                    while (bytesActuallyRead < header.payloadLength && bytesActuallyRead < PayloadConstants_1.PayloadConstants.MaxPayloadLength) {
                        let count = Math.min(header.payloadLength - bytesActuallyRead, PayloadConstants_1.PayloadConstants.MaxPayloadLength);
                        this._receivePayloadBuffer = await this._receiver.receive(count);
                        bytesActuallyRead += this._receivePayloadBuffer.byteLength;
                        contentStream.write(this._receivePayloadBuffer);
                        // If this is a stream we want to keep handing it up as it comes in
                        if (isStream) {
                            this._receiveAction(header, contentStream, bytesActuallyRead);
                        }
                    }
                    if (!isStream) {
                        this._receiveAction(header, contentStream, bytesActuallyRead);
                    }
                }
            }
            catch (error) {
                isClosed = true;
                this.disconnect(new TransportDisconnectedEventArgs_1.TransportDisconnectedEventArgs(error.message));
            }
        }
    }
}
exports.PayloadReceiver = PayloadReceiver;
//# sourceMappingURL=PayloadReceiver.js.map