"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WebSocketTransport {
    /// <summary>
    /// Creates a new instance of the WebSocketTransport class.
    /// </summary>
    /// <param name="ws">The ISocket to build this transport on top of.</param>
    constructor(ws) {
        this._socket = ws;
        this._queue = [];
        this._activeOffset = 0;
        this._activeReceiveCount = 0;
        this._socket.setOnMessageHandler((data) => {
            this.onReceive(data);
        });
        this._socket.setOnErrorHandler((err) => {
            this.onError(err);
        });
        this._socket.setOnCloseHandler(() => {
            this.onClose();
        });
    }
    /// <summary>
    /// Sends the given buffer out over the socket's connection.
    /// </summary>
    /// <param name="buffer">The buffered data to send out over the connection.</param>
    send(buffer) {
        if (this._socket && this._socket.isConnected()) {
            this._socket.write(buffer);
            return buffer.length;
        }
        return 0;
    }
    /// <summary>
    /// Returns true if the transport is connected to a socket.
    /// </summary>
    isConnected() {
        return this._socket.isConnected();
    }
    /// <summary>
    /// Close the socket this transport is connected to.
    /// </summary>
    close() {
        if (this._socket && this._socket.isConnected()) {
            this._socket.close();
        }
    }
    /// <summary>
    /// Attempt to receive incoming data from the connected socket.
    /// </summary>
    /// <param name="count">The number of bytes to attempt to receive.</param>
    /// <returns> A buffer populated with the received data.</returns>
    async receive(count) {
        if (this._activeReceiveResolve) {
            throw new Error('Cannot call receiveAsync more than once before it has returned.');
        }
        this._activeReceiveCount = count;
        let promise = new Promise((resolve, reject) => {
            this._activeReceiveResolve = resolve;
            this._activeReceiveReject = reject;
        });
        this.trySignalData();
        return promise;
    }
    /// <summary>
    /// Sets the transport to attempt to receive incoming data that has not yet arrived.
    /// </summary>
    /// <param name="data">A buffer to store incoming data in.</param>
    onReceive(data) {
        if (this._queue && data && data.byteLength > 0) {
            this._queue.push(Buffer.from(data));
            this.trySignalData();
        }
    }
    onClose() {
        if (this._activeReceiveReject) {
            this._activeReceiveReject(new Error('Socket was closed.'));
        }
        this._active = null;
        this._activeOffset = 0;
        this._activeReceiveResolve = null;
        this._activeReceiveReject = null;
        this._activeReceiveCount = 0;
        this._socket = null;
    }
    onError(err) {
        if (this._activeReceiveReject) {
            this._activeReceiveReject(err);
        }
        this.onClose();
    }
    trySignalData() {
        if (this._activeReceiveResolve) {
            if (!this._active && this._queue.length > 0) {
                this._active = this._queue.shift();
                this._activeOffset = 0;
            }
            if (this._active) {
                if (this._activeOffset === 0 && this._active.length === this._activeReceiveCount) {
                    // can send the entire _active buffer
                    let buffer = this._active;
                    this._active = null;
                    this._activeReceiveResolve(buffer);
                }
                else {
                    // create a Buffer.from and copy some of the contents into it
                    let available = Math.min(this._activeReceiveCount, this._active.length - this._activeOffset);
                    let buffer = Buffer.alloc(available);
                    this._active.copy(buffer, 0, this._activeOffset, this._activeOffset + available);
                    this._activeOffset += available;
                    // if we used all of active, set it to undefined
                    if (this._activeOffset >= this._active.length) {
                        this._active = null;
                        this._activeOffset = 0;
                    }
                    this._activeReceiveResolve(buffer);
                }
                this._activeReceiveCount = 0;
                this._activeReceiveReject = null;
                this._activeReceiveResolve = null;
            }
        }
    }
}
exports.WebSocketTransport = WebSocketTransport;
//# sourceMappingURL=WebSocketTransport.js.map