/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotTelemetryClient, NullTelemetryClient, TurnContext } from 'botbuilder-core';
import { DialogContext } from './dialogContext';
import { Configurable } from './configurable';

/**
 * Tracking information persisted for an instance of a dialog on the stack.
 */
export interface DialogInstance {
    /**
     * ID of the dialog this instance is for.
     */
    id: string;

    /**
     * The instances persisted state or the index of the state object to use.
     * 
     * @remarks
     * When the dialog referenced by [id](#id) derives from `DialogCommand`, the state field will 
     * contain the stack index of the state object that should be inherited by the command.  
     */
    state: any;
}

/**
 * Codes indicating why a waterfall step is being called.
 */
export enum DialogReason {
    /**
     * A dialog is being started through a call to `DialogContext.beginDialog()`.
     */
    beginCalled = 'beginCalled',

    /**
     * A dialog is being continued through a call to `DialogContext.continueDialog()`.
     */
    continueCalled = 'continueCalled',

    /**
     * A dialog ended normally through a call to `DialogContext.endDialog()`.
     */
    endCalled = 'endCalled',

    /**
     * A dialog is ending because its being replaced through a call to `DialogContext.replaceDialog()`.
     */
    replaceCalled = 'replaceCalled',

    /**
     * A dialog was cancelled as part of a call to `DialogContext.cancelAllDialogs()`.
     */
    cancelCalled = 'cancelCalled',

    /**
     * A step was advanced through a call to `WaterfallStepContext.next()`.
     */
    nextCalled = 'nextCalled'
}

/**
 * Codes indicating the state of the dialog stack after a call to `DialogContext.continueDialog()`
 * or `DialogContext.beginDialog()`.
 */
export enum DialogTurnStatus {
    /**
     * Indicates that there is currently nothing on the dialog stack.
     */
    empty = 'empty',

    /**
     * Indicates that the dialog on top is waiting for a response from the user.
     */
    waiting = 'waiting',

    /**
     * Indicates that the dialog completed successfully, the result is available, and the stack is
     * empty.
     */
    complete = 'complete',

    /**
     * Indicates that the dialog was cancelled and the stack is empty.
     */
    cancelled = 'cancelled'
}

/**
 * Returned by `Dialog.continueDialog()` and `DialogContext.beginDialog()` to indicate whether a
 * dialog is still active after the turn has been processed by the dialog.
 *
 * @remarks
 * This can be used to determine if the dialog stack is empty:
 *
 * ```JavaScript
 * const result = await dialogContext.continueDialog();
 *
 * if (result.status == DialogTurnStatus.empty) {
 *     await dialogContext.beginDialog('helpDialog');
 * }
 * ```
 *
 * Or to access the result of a dialog that just completed:
 *
 * ```JavaScript
 * const result = await dialogContext.continueDialog();
 *
 * if (result.status == DialogTurnStatus.completed) {
 *     const survey = result.result;
 *     await submitSurvey(survey);
 * } else if (result.status == DialogTurnStatus.empty) {
 *     await dialogContext.beginDialog('surveyDialog');
 * }
 * ```
 * @param T (Optional) type of result returned by the active dialog when it calls `DialogContext.endDialog()`.
 */
export interface DialogTurnResult<T = any> {
    /**
     * Gets or sets the current status of the stack.
     */
    status: DialogTurnStatus;

    /**
     * Final result returned by a dialog that just completed. Can be `undefined` even when [hasResult](#hasResult) is true.
     */
    result?: T;

    /**
     * If true, a `DialogCommand` has ended its parent container and the parent should not perform 
     * any further processing.
     */
    parentEnded?: boolean;
}

export interface DialogEvent<T = any> {
    /**
     * If `true` the event will be bubbled to the parent `DialogContext` if not handled by the 
     * current dialog.
     */
    bubble: boolean;

    /**
     * Name of the event being raised.
     */
    name: string;

    /**
     * (Optional) value associated with the event.
     */
    value?: T;
}

export interface DialogConfiguration {
    id?: string;

    tags?: string[];

    inputBindings?: { [option:string]: string; };

    outputBinding?: string;

    telemetryClient?: BotTelemetryClient;
}

/**
 * Base class for all dialogs.
 */
export abstract class Dialog<O extends object = {}> extends Configurable {
    private _id: string;

    /**
     * Signals the end of a turn by a dialog method or waterfall/sequence step.
     */
    public static EndOfTurn: DialogTurnResult = { status: DialogTurnStatus.waiting };

    /**
     * (Optional) set of tags assigned to the dialog.
     */
    public readonly tags: string[] = [];

    /**
     * (Optional) if true, the dialog will inherit its parents state.
     */
    public inheritState = false;

    /**
     * (Optional) JSONPath expression for the memory slots to bind the dialogs options to on a 
     * call to `beginDialog()`. 
     */
    public readonly inputProperties: { [option:string]: string; } = {};

    /**
     * (Optional) JSONPath expression for the memory slot to bind the dialogs result to when 
     * `endDialog()` is called.
     */
    public outputProperty: string;

    /**
     * The telemetry client for logging events.
     * Default this to the NullTelemetryClient, which does nothing.
     */
    protected _telemetryClient: BotTelemetryClient =  new NullTelemetryClient();

    /**
     * Creates a new Dialog instance.
     * @param dialogId (Optional) unique ID to assign to the dialog.
     */
    constructor(dialogId?: string) {
        super();
        this._id = dialogId;
    }

    /**
     * Unique ID of the dialog.
     * 
     * @remarks
     * This will be automatically generated if not specified.
     */
    public get id(): string {
        if (this._id === undefined) {
            this._id = this.onComputeID();
        }
        return this._id;
    }

    public set id(value: string) {
        this._id = value;
    }

    /** 
     * Retrieve the telemetry client for this dialog.
     */
    public get telemetryClient(): BotTelemetryClient {
        return this._telemetryClient;
    }

    /** 
     * Set the telemetry client for this dialog.
     */
    public set telemetryClient(client: BotTelemetryClient) {
        this._telemetryClient = client ? client : new NullTelemetryClient();
    }

    /**
     * Fluent method for configuring the dialogs properties. 
     * @param config Configuration properties to apply. 
     */
    public configure(config: DialogConfiguration): this {
        return super.configure(config);
    }

    /**
     * Called when a new instance of the dialog has been pushed onto the stack and is being
     * activated.
     *
     * @remarks
     * MUST be overridden by derived class. Dialogs that only support single-turn conversations
     * should call `return await DialogContext.endDialog();` at the end of their implementation.
     * @param dc The dialog context for the current turn of conversation.
     * @param options (Optional) arguments that were passed to the dialog in the call to `DialogContext.beginDialog()`.
     */
    public abstract beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult>;

    /**
     * Called to continue execution of a multi-turn dialog.
     *
     * @remarks
     * SHOULD be overridden by multi-turn dialogs.
     * @param dc The dialog context for the current turn of conversation.
     */
    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // By default just end the current dialog.
        return dc.endDialog();
    }

    /**
     * Called when an instance of the dialog is being returned to from another dialog.
     *
     * @remarks
     * SHOULD be overridden by multi-turn dialogs that start other dialogs using
     * `DialogContext.beginDialog()` or `DialogContext.prompt()`. The default implementation calls
     * `DialogContext.endDialog()` with any results returned from the ending dialog.
     * @param dc The dialog context for the current turn of conversation.
     * @param reason The reason the dialog is being resumed. This will typically be a value of `DialogReason.endCalled`.
     * @param result (Optional) value returned from the dialog that was called. The type of the value returned is dependant on the dialog that was called.
     */
    public async resumeDialog(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        // By default just end the current dialog and return result to parent.
        return dc.endDialog(result);
    }

    /**
     * Called when an event has been raised, using `DialogContext.emitEvent()`.
     * 
     * @remarks
     * The dialog is responsible for bubbling the event up to its parent dialog. In most cases
     * developers should override `onPreBubbleEvent()` or `onPostBubbleEvent()` versus 
     * overriding `onDialogEvent()` directly.
     * @param dc The dialog context for the current turn of conversation.
     * @param event The event being raised.
     * @returns `true` if the event is handled by the current dialog and bubbling should stop.
     */
    public async onDialogEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        // Before bubble
        let handled = await this.onPreBubbleEvent(dc, event);
        
        // Bubble as needed
        if (!handled && event.bubble && dc.parent) {
            handled = await dc.parent.emitEvent(event.name, event.value, true);
        }
        
        // Post bubble
        if (!handled) {
            handled = await this.onPostBubbleEvent(dc, event);
        }

        return handled;
    }

    /**
     * Called when the dialog has been requested to re-prompt the user for input.
     *
     * @remarks
     * SHOULD be overridden by multi-turn dialogs that wish to provide custom re-prompt logic. The
     * default implementation performs no action.
     * @param context Context for the current turn of conversation.
     * @param instance The instance of the current dialog.
     */
    public async repromptDialog(context: TurnContext, instance: DialogInstance): Promise<void> {
        // No-op by default
    }

    /**
     * Called when the dialog is ending.
     *
     * @remarks
     * SHOULD be overridden by dialogs that wish to perform some logging or cleanup action anytime
     * the dialog ends.
     * @param context Context for the current turn of conversation.
     * @param instance The instance of the current dialog.
     * @param reason The reason the dialog is ending.
     */
    public async endDialog(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        // No-op by default
    }

    /**
     * Called when a unique ID needs to be computed for a dialog.
     * 
     * @remarks
     * SHOULD be overridden to provide a more contextually relevant ID. The default implementation 
     * returns `dialog[${this.bindingPath()}]`. 
     */
    protected onComputeID(): string {
        return `dialog[${this.bindingPath()}]`;
    }

    /**
     * Called before an event is bubbled to its parent.
     * 
     * @remarks
     * This is a good place to perform interception of an event as returning `true` will prevent
     * any further bubbling of the event to the dialogs parents and will also prevent any child
     * dialogs from performing their default processing.
     * @param dc The dialog context for the current turn of conversation.
     * @param event The event being raised.
     * @returns `true` if the event is handled by the current dialog and further processing should stop.
     */
    protected async onPreBubbleEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        return false;
    }

    /**
     * Called after an event was bubbled to all parents and wasn't handled.
     * 
     * @remarks
     * This is a good place to perform default processing logic for an event. Returning `true` will
     * prevent any processing of the event by child dialogs.
     * @param dc The dialog context for the current turn of conversation.
     * @param event The event being raised.
     * @returns `true` if the event is handled by the current dialog and further processing should stop.
     */
    protected async onPostBubbleEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        return false;
    }

    /**
     * Aids in computing a unique ID for a dialog by returning the current input or output property
     * the dialog is bound to.
     * @param hashOutput (Optional) if true the output will be hashed to less than 15 characters before returning.
     */
    protected bindingPath(hashOutput = true): string {
        let output = '';
        if (this.inputProperties.hasOwnProperty('value') && this.inputProperties['value']) {
            output = this.inputProperties['value'];
        } else if (this.outputProperty && this.outputProperty.length) {
            output = this.outputProperty;
        }

        return hashOutput ? this.hashedLabel(output) : output;
    }

    /**
     * Aids with computing a unique ID for a dialog by computing a 32 bit hash for a string.
     * 
     * @remarks
     * The source for this function was derived from the following article:
     * 
     * https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
     * 
     * @param label String to generate a hash for.
     * @returns A string that is 15 characters or less in length.
     */
    protected hashedLabel(label: string): string {
        const l = label.length;
        if (label.length > 15)
        {
            let hash = 0;
            for (let i = 0; i < l; i++) {
                const chr = label.charCodeAt(i);
                hash  = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32 bit integer
            }
            label = `${label.substr(0, 5)}${hash.toString()}`;
        }

        return label;
    }
}
