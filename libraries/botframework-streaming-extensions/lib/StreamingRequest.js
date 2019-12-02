"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const HttpContentStream_1 = require("./HttpContentStream");
const SubscribableStream_1 = require("./SubscribableStream");
class StreamingRequest {
    constructor() {
        /// <summary>
        /// List of associated streams
        /// </summary>
        this.streams = [];
    }
    /// <summary>
    /// Creates a <see cref="StreamingRequest"/> with the passed in method, path, and body.
    /// </summary>
    /// <param name="method">The HTTP verb to use for this request.</param>
    /// <param name="path">Optional path where the resource can be found on the remote server.</param>
    /// <param name="body">Optional body to send to the remote server.</param>
    /// <returns>On success returns a <see cref="StreamingRequest"/> with appropriate status code and body.</returns>
    static create(method, path, body) {
        let request = new StreamingRequest();
        request.verb = method;
        request.path = path;
        if (body) {
            request.setBody(body);
        }
        return request;
    }
    /// <summary>
    /// Adds a new stream attachment to this <see cref="StreamingRequest"/>.
    /// </summary>
    /// <param name="content">The <see cref="HttpContent"/> to include in the new stream attachment.</param>
    addStream(content) {
        if (!content) {
            throw new Error('Argument Undefined Exception: content undefined.');
        }
        this.streams.push(new HttpContentStream_1.HttpContentStream(content));
    }
    /// <summary>
    /// Sets the contents of the body of this streamingRequest.
    /// </summary>
    /// <param name="body">The JSON text to write to the body of the streamingRequest.</param>
    setBody(body) {
        if (typeof body === 'string') {
            let stream = new SubscribableStream_1.SubscribableStream();
            stream.write(body, 'utf8');
            this.addStream(new HttpContentStream_1.HttpContent({
                type: 'application/json; charset=utf-8',
                contentLength: stream.length
            }, stream));
        }
        else if (typeof body === 'object') {
            this.addStream(body);
        }
    }
}
exports.StreamingRequest = StreamingRequest;
//# sourceMappingURL=StreamingRequest.js.map