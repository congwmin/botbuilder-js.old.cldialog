"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BrowserWebSocket {
    /// <summary>
    /// Creates a new instance of the BrowserWebSocket class.
    /// </summary>
    /// <param name="socket">The socket object to build this connection on.</param>
    constructor(socket) {
        if (socket) {
            this.webSocket = socket;
        }
    }
    /// <summary>
    /// Connects to the supporting socket using WebSocket protocol.
    /// </summary>
    /// <param name="serverAddress">The address the server is listening on.</param>
    async connect(serverAddress) {
        let resolver;
        let rejector;
        if (!this.webSocket) {
            this.webSocket = new WebSocket(serverAddress);
        }
        this.webSocket.onerror = (e) => {
            rejector(e);
        };
        this.webSocket.onopen = (e) => {
            resolver(e);
        };
        return new Promise((resolve, reject) => {
            resolver = resolve;
            rejector = reject;
        });
    }
    /// <summary>
    /// True if the socket is currently connected.
    /// </summary>
    isConnected() {
        return this.webSocket.readyState === 1;
    }
    /// <summary>
    /// Writes a buffer to the socket and sends it.
    /// </summary>
    /// <param name="buffer">The buffer of data to send across the connection.</param>
    write(buffer) {
        this.webSocket.send(buffer);
    }
    /// <summary>
    /// Close the socket.
    /// </summary>
    close() {
        this.webSocket.close();
    }
    /// <summary>
    /// Set the handler for text and binary messages received on the socket.
    /// </summary>
    setOnMessageHandler(handler) {
        let packets = [];
        this.webSocket.onmessage = (evt) => {
            let fileReader = new FileReader();
            let queueEntry = { buffer: null };
            packets.push(queueEntry);
            fileReader.onload = (e) => {
                let t = e.target;
                queueEntry['buffer'] = t.result;
                if (packets[0] === queueEntry) {
                    while (0 < packets.length && packets[0]['buffer']) {
                        handler(packets[0]['buffer']);
                        packets.splice(0, 1);
                    }
                }
            };
            fileReader.readAsArrayBuffer(evt.data);
        };
    }
    /// <summary>
    /// Set the callback to call when encountering errors.
    /// </summary>
    setOnErrorHandler(handler) {
        this.webSocket.onerror = (error) => { if (error) {
            handler(error);
        } };
    }
    /// <summary>
    /// Set the callback to call when encountering socket closures.
    /// </summary>
    setOnCloseHandler(handler) {
        this.webSocket.onclose = handler;
    }
}
exports.BrowserWebSocket = BrowserWebSocket;
//# sourceMappingURL=BrowserWebSocket.js.map