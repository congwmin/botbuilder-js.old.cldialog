"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PayloadConstants_1 = require("./PayloadConstants");
class HeaderSerializer {
    static serialize(header, buffer) {
        buffer.write(header.payloadType, this.TypeOffset, 1, this.Encoding);
        buffer.write(this.Delimiter, this.TypeDelimiterOffset, 1, this.Encoding);
        buffer.write(this.headerLengthPadder(header.payloadLength, this.LengthLength, '0'), this.LengthOffset, this.LengthLength, this.Encoding);
        buffer.write(this.Delimiter, this.LengthDelimeterOffset, 1, this.Encoding);
        buffer.write(header.id, this.IdOffset);
        buffer.write(this.Delimiter, this.IdDelimeterOffset, 1, this.Encoding);
        buffer.write(header.end ? this.End : this.NotEnd, this.EndOffset);
        buffer.write(this.Terminator, this.TerminatorOffset);
    }
    static deserialize(buffer) {
        let jsonBuffer = buffer.toString(this.Encoding);
        let headerArray = jsonBuffer.split(this.Delimiter);
        if (headerArray.length !== 4) {
            throw Error('Cannot parse header, header is malformed.');
        }
        const [payloadType, length, id, headerEnd] = headerArray;
        const end = headerEnd === '1\n';
        const payloadLength = Number(length);
        const header = { end, payloadLength, payloadType, id };
        if (!(header.payloadLength <= PayloadConstants_1.PayloadConstants.MaxPayloadLength && header.payloadLength >= PayloadConstants_1.PayloadConstants.MinLength)) {
            throw Error('Header Length is missing or malformed.');
        }
        if (header.payloadType.length !== this.TypeDelimiterOffset) {
            throw Error('Header Type is missing or malformed.');
        }
        if (!header.id || !header.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) || header.id.length !== this.IdLength) {
            throw Error('Header ID is missing or malformed.');
        }
        if (!(headerEnd === '0\n' || headerEnd === '1\n')) {
            throw Error('Header End is missing or not a valid value.');
        }
        return header;
    }
    static headerLengthPadder(lengthValue, totalLength, padChar) {
        let result = Array(totalLength + 1)
            .join(padChar);
        let lengthString = lengthValue.toString();
        return (result + lengthString).slice(lengthString.length);
    }
}
HeaderSerializer.Delimiter = '.';
HeaderSerializer.Terminator = '\n';
HeaderSerializer.End = '1';
HeaderSerializer.NotEnd = '0';
HeaderSerializer.TypeOffset = 0;
HeaderSerializer.TypeDelimiterOffset = 1;
HeaderSerializer.LengthOffset = 2;
HeaderSerializer.LengthLength = 6;
HeaderSerializer.LengthDelimeterOffset = 8;
HeaderSerializer.IdOffset = 9;
HeaderSerializer.IdLength = 36;
HeaderSerializer.IdDelimeterOffset = 45;
HeaderSerializer.EndOffset = 46;
HeaderSerializer.TerminatorOffset = 47;
HeaderSerializer.Encoding = 'utf8';
exports.HeaderSerializer = HeaderSerializer;
//# sourceMappingURL=HeaderSerializer.js.map