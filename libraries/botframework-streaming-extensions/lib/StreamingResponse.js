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
class StreamingResponse {
    constructor() {
        this.streams = [];
    }
    /// <summary>
    /// Creates a response using the passed in statusCode and optional body.
    /// </summary>
    /// <param name="statusCode">The <see cref="HttpStatusCode"/> to set on the <see cref="StreamingResponse"/>.</param>
    /// <param name="body">An optional body containing additional information.</param>
    /// <returns>A streamingResponse with the appropriate statuscode and passed in body.</returns>
    static create(statusCode, body) {
        let response = new StreamingResponse();
        response.statusCode = statusCode;
        if (body) {
            response.addStream(body);
        }
        return response;
    }
    /// <summary>
    /// Adds a new stream attachment to this <see cref="StreamingResponse"/>.
    /// </summary>
    /// <param name="content">The <see cref="HttpContent"/> to include in the new stream attachment.</param>
    addStream(content) {
        this.streams.push(new HttpContentStream_1.HttpContentStream(content));
    }
    /// <summary>
    /// Sets the contents of the body of this streamingResponse.
    /// </summary>
    /// <param name="body">The JSON text to write to the body of the streamingResponse.</param>
    setBody(body) {
        let stream = new SubscribableStream_1.SubscribableStream();
        stream.write(JSON.stringify(body), 'utf8');
        this.addStream(new HttpContentStream_1.HttpContent({
            type: 'application/json; charset=utf-8',
            contentLength: stream.length
        }, stream));
    }
}
exports.StreamingResponse = StreamingResponse;
//# sourceMappingURL=StreamingResponse.js.map