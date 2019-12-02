import { ConversationLearner, ICLOptions, OnSessionEndCallback, OnSessionStartCallback, ICallbackInput, EntityDetectionCallback } from '@conversationlearner/sdk'
import { getEntityDisplayValueMap } from '@conversationlearner/models'
//import { Dialog, DialogContext, DialogTurnResult, DialogConfiguration, DialogConsultation, DialogTurnStatus, DialogConsultationDesire, DialogEvent } from 'botbuilder-dialogs'
import { Dialog, DialogContext, DialogTurnResult, DialogConfiguration, DialogTurnStatus, DialogEvent } from 'botbuilder-dialogs'
import { Storage, TurnContext } from 'botbuilder'

export interface CLDialogConfiguration extends DialogConfiguration {
    modelId: string
}

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

export class CLDialog<O extends object = {}> extends Dialog<O> {

    protected cl: ConversationLearner
    protected clRouter: any
    private readonly defaultOnSessionEndCallback: OnSessionEndCallback = async (context, memoryManager) => {
        const dContext = (<CLContext>(context as any)).dialogContext
        await dContext.emitEvent(CLDialog_ENDED_EVENT, memoryManager, false)
        dContext.state.turn.set(CLDialog_Result, memoryManager.curMemories)
    }

    constructor(options: ICLOptions, storage: Storage, dialogId?: string) {
        super(dialogId)
        this.clRouter = ConversationLearner.Init(options, storage)
        this.outputProperty = CLDialog_Result
    }

    public set resultProperty(path: string) {
        this.outputProperty = path
    }

    public get resultProperty(): string {
        return this.outputProperty
    }

    public configure(config: CLDialogConfiguration): this {
        this.cl = new ConversationLearner(config.modelId)
        return super.configure(this)
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult<any>> {
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
}