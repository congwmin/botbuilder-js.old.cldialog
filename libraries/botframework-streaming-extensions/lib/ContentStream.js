"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ContentStream {
    constructor(id, assembler) {
        if (!assembler) {
            throw Error('Null Argument Exception');
        }
        this.id = id;
        this.assembler = assembler;
    }
    get contentType() {
        return this.assembler.payloadType;
    }
    get length() {
        return this.assembler.contentLength;
    }
    getStream() {
        if (!this.stream) {
            this.stream = this.assembler.getPayloadStream();
        }
        return this.stream;
    }
    cancel() {
        this.assembler.close();
    }
    async readAsString() {
        const { bufferArray } = await this.readAll();
        return (bufferArray || []).map(result => result.toString('utf8')).join('');
    }
    async readAsJson() {
        let stringToParse = await this.readAsString();
        try {
            return JSON.parse(stringToParse);
        }
        catch (error) {
            throw error;
        }
    }
    async readAll() {
        // do a read-all
        let allData = [];
        let count = 0;
        let stream = this.getStream();
        // populate the array with any existing buffers
        while (count < stream.length) {
            let chunk = stream.read(stream.length);
            allData.push(chunk);
            count += chunk.length;
        }
        if (count < this.length) {
            let readToEnd = new Promise((resolve) => {
                let callback = (cs) => (chunk) => {
                    allData.push(chunk);
                    count += chunk.length;
                    if (count === cs.length) {
                        resolve(true);
                    }
                };
                stream.subscribe(callback(this));
            });
            await readToEnd;
        }
        return { bufferArray: allData, size: count };
    }
}
exports.ContentStream = ContentStream;
//# sourceMappingURL=ContentStream.js.map