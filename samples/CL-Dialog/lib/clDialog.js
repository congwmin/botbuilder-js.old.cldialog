"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@conversationlearner/sdk");
const models_1 = require("@conversationlearner/models");
//import { Dialog, DialogContext, DialogTurnResult, DialogConfiguration, DialogConsultation, DialogTurnStatus, DialogConsultationDesire, DialogEvent } from 'botbuilder-dialogs'
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_1 = require("botbuilder");
exports.CLDialog_ENDED_EVENT = "CLDialog_ENDED_EVENT";
const CLDialog_Result = "dialog.lastResult";
const CLDialog_ENDED = "CLDialog_ENDED";
class CLContext extends botbuilder_1.TurnContext {
    constructor(dc) {
        super(dc.context);
        this.dialogContext = dc;
    }
}
exports.CLContext = CLContext;
class CLDialog extends botbuilder_dialogs_1.Dialog {
    constructor(options, storage, dialogId) {
        super(dialogId);
        this.defaultOnSessionEndCallback = async (context, memoryManager) => {
            const dContext = context.dialogContext;
            await dContext.emitEvent(exports.CLDialog_ENDED_EVENT, memoryManager, false);
            dContext.state.turn.set(CLDialog_Result, memoryManager.curMemories);
        };
        this.clRouter = sdk_1.ConversationLearner.Init(options, storage);
        this.outputProperty = CLDialog_Result;
    }
    set resultProperty(path) {
        this.outputProperty = path;
    }
    get resultProperty() {
        return this.outputProperty;
    }
    configure(config) {
        this.cl = new sdk_1.ConversationLearner(config.modelId);
        return super.configure(this);
    }
    async beginDialog(dc, options) {
        await this.cl.StartSession(this.CreateContextForCL(dc));
        const continueResult = await this.continueDialog(dc);
        dc.state.turn.set(CLDialog_ENDED, false);
        this.cl.OnSessionEndCallback(this.defaultOnSessionEndCallback);
        return await continueResult;
    }
    async continueDialog(dc) {
        const result = await this.cl.recognize(this.CreateContextForCL(dc));
        if (result) {
            await this.cl.SendResult(result);
            if (dc.state.turn.get(CLDialog_ENDED)) {
                return await dc.endDialog(models_1.getEntityDisplayValueMap(dc.state.turn.get(CLDialog_Result)));
            }
            else {
                return {
                    status: botbuilder_dialogs_1.DialogTurnStatus.waiting
                };
            }
        }
        else {
            await dc.context.sendActivity("Conversation Leaner couldn't predict any action! Ending CLDialog...");
            return await dc.endDialog();
        }
    }
    async onDialogEvent(dc, event) {
        switch (event.name) {
            case exports.CLDialog_ENDED_EVENT:
                dc.state.turn.set(CLDialog_ENDED, true);
                return false;
        }
    }
    OnSessionStartCallback(target) {
        this.cl.OnSessionStartCallback(target);
    }
    OnSessionEndCallback(target) {
        this.cl.OnSessionEndCallback(async (context, memoryManage, sessionEndState, data) => {
            await target(context, memoryManage, sessionEndState, data);
            await this.defaultOnSessionEndCallback(context, memoryManage, sessionEndState, data);
        });
    }
    AddCallback(callback) {
        this.cl.AddCallback(callback);
    }
    EntityDetectionCallback(target) {
        this.cl.EntityDetectionCallback(target);
    }
    CreateContextForCL(dc) {
        return new CLContext(dc);
    }
}
exports.CLDialog = CLDialog;
//# sourceMappingURL=clDialog.js.map