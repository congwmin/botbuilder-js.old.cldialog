/**
 * @module botbuilder-expression-parser
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ANTLRErrorListener, RecognitionException, Recognizer } from 'antlr4ts';

// tslint:disable-next-line: completed-docs
export class ErrorListener implements ANTLRErrorListener<any> {
    public static readonly Instance: ErrorListener = new ErrorListener();

    public syntaxError<T>(
       _recognizer: Recognizer<T, any>,
       _offendingSymbol: T,
       line: number,
       charPositionInLine: number,
       msg: string,
       _e: RecognitionException | undefined): void {
            throw Error(`syntax error at line ${line}:${charPositionInLine} ${msg}`);
    }
}
