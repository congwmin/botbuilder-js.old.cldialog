/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, RecognizerResult } from 'botbuilder-core';

export interface Recognizer {
    recognize(context: TurnContext): Promise<RecognizerResult>;
}

export interface IntentMap {
    [name: string]: { score: number; };
} 

export function createRecognizerResult(text: string, intents?: IntentMap, entities?: object ): RecognizerResult {
    if (!intents) {
        intents = { 'None': { score: 0.0 } }; 
    }
    if (!entities) {
        entities = {};
    }
    return { text: text, intents: intents, entities: entities };
}
