/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IHeader } from '../Interfaces/IHeader';
export declare class HeaderSerializer {
    static readonly Delimiter = ".";
    static readonly Terminator = "\n";
    static readonly End = "1";
    static readonly NotEnd = "0";
    static readonly TypeOffset: number;
    static readonly TypeDelimiterOffset = 1;
    static readonly LengthOffset = 2;
    static readonly LengthLength = 6;
    static readonly LengthDelimeterOffset = 8;
    static readonly IdOffset = 9;
    static readonly IdLength = 36;
    static readonly IdDelimeterOffset = 45;
    static readonly EndOffset = 46;
    static readonly TerminatorOffset = 47;
    static readonly Encoding = "utf8";
    static serialize(header: IHeader, buffer: Buffer): void;
    static deserialize(buffer: Buffer): IHeader;
    static headerLengthPadder(lengthValue: number, totalLength: number, padChar: string): string;
}
