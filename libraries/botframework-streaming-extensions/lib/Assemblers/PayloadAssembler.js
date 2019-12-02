"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const SubscribableStream_1 = require("../SubscribableStream");
const Payloads_1 = require("../Payloads");
const ContentStream_1 = require("../ContentStream");
class PayloadAssembler {
    constructor(streamManager, params) {
        this._byteOrderMark = 0xFEFF;
        this._utf = 'utf8';
        if (params.header) {
            this.id = params.header.id;
            this.payloadType = params.header.payloadType;
            this.contentLength = params.header.payloadLength;
            this.end = params.header.end;
        }
        else {
            this.id = params.id;
        }
        if (!this.id) {
            throw Error('An ID must be supplied when creating an assembler.');
        }
        this._streamManager = streamManager;
        this._onCompleted = params.onCompleted;
    }
    getPayloadStream() {
        if (!this.stream) {
            this.stream = this.createPayloadStream();
        }
        return this.stream;
    }
    onReceive(header, stream, contentLength) {
        this.end = header.end;
        if (header.payloadType === Payloads_1.PayloadTypes.response || header.payloadType === Payloads_1.PayloadTypes.request) {
            this.process(stream)
                .then()
                .catch();
        }
        else if (header.end) {
            stream.end();
        }
    }
    close() {
        this._streamManager.closeStream(this.id);
    }
    createPayloadStream() {
        return new SubscribableStream_1.SubscribableStream();
    }
    payloadFromJson(json) {
        return JSON.parse((json.charCodeAt(0) === this._byteOrderMark) ? json.slice(1) : json);
    }
    stripBOM(input) {
        return (input.charCodeAt(0) === this._byteOrderMark) ? input.slice(1) : input;
    }
    async process(stream) {
        let streamData = stream.read(stream.length);
        if (!streamData) {
            return;
        }
        let streamDataAsString = streamData.toString(this._utf);
        if (this.payloadType === Payloads_1.PayloadTypes.request) {
            await this.processRequest(streamDataAsString);
        }
        else if (this.payloadType === Payloads_1.PayloadTypes.response) {
            await this.processResponse(streamDataAsString);
        }
    }
    async processResponse(streamDataAsString) {
        let responsePayload = this.payloadFromJson(this.stripBOM(streamDataAsString));
        let receiveResponse = { streams: [], statusCode: responsePayload.statusCode };
        await this.processStreams(responsePayload, receiveResponse);
    }
    async processRequest(streamDataAsString) {
        let requestPayload = this.payloadFromJson(streamDataAsString);
        let receiveRequest = { streams: [], path: requestPayload.path, verb: requestPayload.verb };
        await this.processStreams(requestPayload, receiveRequest);
    }
    async processStreams(responsePayload, receiveResponse) {
        if (responsePayload.streams) {
            responsePayload.streams.forEach((responseStream) => {
                let contentAssembler = this._streamManager.getPayloadAssembler(responseStream.id);
                contentAssembler.payloadType = responseStream.contentType;
                contentAssembler.contentLength = responseStream.length;
                receiveResponse.streams.push(new ContentStream_1.ContentStream(responseStream.id, contentAssembler));
            });
        }
        await this._onCompleted(this.id, receiveResponse);
    }
}
exports.PayloadAssembler = PayloadAssembler;
//# sourceMappingURL=PayloadAssembler.js.map