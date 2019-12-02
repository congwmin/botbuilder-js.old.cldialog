/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogCommand, DialogTurnResult, DialogConfiguration, DialogContext, DialogTurnStatus, DialogEvent } from 'botbuilder-dialogs';
// import { Storage } from 'botbuilder'
import { TurnContext, Storage } from 'botbuilder-core'
import { MemoryStorage } from 'botbuilder';
import { ConversationLearner, ICLOptions, OnSessionEndCallback, OnSessionStartCallback, ICallbackInput, EntityDetectionCallback } from '@conversationlearner/sdk'
import { getEntityDisplayValueMap } from '@conversationlearner/models'

export const CLDialog_ENDED_EVENT = "CLDialog_ENDED_EVENT"
const CLDialog_Result = "dialog.lastResult"
const CLDialog_ENDED = "CLDialog_ENDED"

export class CLContext extends TurnContext {

    public readonly dialogContext: DialogContext

    public constructor(dc: DialogContext) {
        super(dc.context)
        this.dialogContext = dc
    }

}

export class CLDialog<O extends object = {}> extends DialogCommand<O> {    
    
    constructor();
    constructor(luisAuthoringKey: string, modelId: string, storage?: Storage, dialogId?: string);
    constructor(luisAuthoringKey?: string, modelId?: string, storage?: Storage, dialogId?: string) {
        super()
        if (luisAuthoringKey) {
            if (storage) { this.storage = storage }
            else { this.storage = new MemoryStorage()}
            this.options = <ICLOptions> {
                LUIS_AUTHORING_KEY: luisAuthoringKey,
                CONVERSATION_LEARNER_SERVICE_URI: 'https://westus.api.cognitive.microsoft.com/conversationlearner/v1.0/',
                botPort: 3978
            }
            this.clRouter = ConversationLearner.Init(this.options, this.storage)
        }
        if (CLDialog_Result) { this.outputProperty = CLDialog_Result }
        if (modelId) { this.cl = new ConversationLearner( modelId ) }
    }

    protected onComputeID(): string {
        const label = this.dialogId ? this.dialogId.toString() : '';
        return `CLDialog[${this.hashedLabel(label)}]`;
    }

    /**
     * LUIS authoring key
     */
    public luisAuthoringKey: string;

    /**
     * ID of the dialog to call
     */
    public dialogId: string;

    /**
     * Options for CLDialog, contains LUIS_AUTHORING_KEY, CONVERSATION_LEARNER_SERVICE_URI, botPort 
     */
    public options: ICLOptions;

    /**
     * Storage to init CLDialog
     */
    public storage: Storage;

    /**
     * ID of conversation learner model
     */
    public modelId: string;

    /**
     * Conversation Learner
     */
    protected cl: ConversationLearner

    /**
     * Conversation Learner Router
     */
    protected clRouter: any

    private readonly defaultOnSessionEndCallback: OnSessionEndCallback = async (context, memoryManager) => {
        const dContext = (<CLContext>(context as any)).dialogContext
        await dContext.emitEvent(CLDialog_ENDED_EVENT, memoryManager, false)
        dContext.state.turn.set(CLDialog_Result, memoryManager.curMemories)
    }

    public set resultProperty(path: string) {
        this.outputProperty = path
    }

    public get resultProperty(): string {
        return this.outputProperty
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult<any>> {
        if (this.luisAuthoringKey) {
            if(!this.storage){
                this.storage = new MemoryStorage()
            }
            this.options = <ICLOptions> {
                LUIS_AUTHORING_KEY: this.luisAuthoringKey,
                CONVERSATION_LEARNER_SERVICE_URI: 'https://westus.api.cognitive.microsoft.com/conversationlearner/v1.0/',
                botPort: 3978
            }
            this.clRouter = ConversationLearner.Init(this.options, this.storage)
        }
        if (CLDialog_Result) { this.outputProperty = CLDialog_Result }
        if (this.modelId) { this.cl = new ConversationLearner( this.modelId ) }
        else { this.cl = new ConversationLearner('880b7acf-00fd-4f38-a1d6-4ed405610959') }
        await this.cl.StartSession(this.CreateContextForCL(dc) as any)
        const continueResult = await this.continueDialog(dc)
        dc.state.turn.set(CLDialog_ENDED, false)
        this.cl.OnSessionEndCallback(this.defaultOnSessionEndCallback)
        return await continueResult
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult<any>> {

        const result = await this.cl.recognize(this.CreateContextForCL(dc) as any)

            if (result) {
                await this.cl.SendResult(result);

                if (dc.state.turn.get<Boolean>(CLDialog_ENDED)) {
                    return await dc.endDialog(getEntityDisplayValueMap(dc.state.turn.get(CLDialog_Result)))
                } else {
                    return <DialogTurnResult>{
                        status: DialogTurnStatus.waiting
                    }
                }
            } else {
                await dc.context.sendActivity("Conversation Leaner couldn't predict any action! Ending CLDialog...")
                return await dc.endDialog()
                // return <DialogTurnResult>{
                //     status: DialogTurnStatus.waiting
                // }
            }
    }

    public async onDialogEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        switch (event.name) {
            case CLDialog_ENDED_EVENT:
                dc.state.turn.set(CLDialog_ENDED, true)
                return false
        }
    }

    public OnSessionStartCallback(target: OnSessionStartCallback): void {
        this.cl.OnSessionStartCallback(target)
    }

    public OnSessionEndCallback(target: OnSessionEndCallback): void {
        this.cl.OnSessionEndCallback(async (context, memoryManage, sessionEndState, data) => {
            await target(context, memoryManage, sessionEndState, data)
            await this.defaultOnSessionEndCallback(context, memoryManage, sessionEndState, data)
        })
    }

    public AddCallback<T>(callback: ICallbackInput<T>): void {
        this.cl.AddCallback(callback)
    }

    public EntityDetectionCallback(target: EntityDetectionCallback): void {
        this.cl.EntityDetectionCallback(target)
    }

    private CreateContextForCL(dc: DialogContext): CLContext {
        return new CLContext(dc)
    }

    protected async onRunCommand(dc: DialogContext, options?: object): Promise<DialogTurnResult> {
        return await dc.endDialog();
    }
}