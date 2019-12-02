"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const botbuilder_1 = require("botbuilder");
//import { AdaptiveDialog, UnknownIntentRule, SendActivity, IfCondition, SetProperty, EventRule, RuleDialogEventNames, LogStep, CodeStep } from 'botbuilder-dialogs-adaptive';
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const clDialog_1 = require("./clDialog");
// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open echobot.bot file in the Emulator.`);
});
// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword,
});
// Create bots DialogManager and bind to state storage
const bot = new botbuilder_dialogs_1.DialogManager();
bot.storage = new botbuilder_1.MemoryStorage();
// Listen for incoming activities.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route activity to bot.
        await bot.onTurn(context);
    });
});
// init conversation learner dialog
const options = {
    LUIS_AUTHORING_KEY: 'db27ae1536f044a4b07df08b607dcd17',
    CONVERSATION_LEARNER_SERVICE_URI: 'https://westus.api.cognitive.microsoft.com/conversationlearner/v1.0/',
    botPort: 3978
};
const clDialog = new clDialog_1.CLDialog(options, bot.storage);
// hi-bye 4a9bd5ca-0b48-4ae5-9cb6-f8195ba8c05a
clDialog.configure({ modelId: '4a9bd5ca-0b48-4ae5-9cb6-f8195ba8c05a' });
// Initialize bots root dialog
const dialogs = new botbuilder_dialogs_adaptive_1.AdaptiveDialog();
bot.rootDialog = dialogs;
// Handle unknown intents
dialogs.addRule(new botbuilder_dialogs_adaptive_1.UnknownIntentRule([
    new botbuilder_dialogs_adaptive_1.IfCondition(`conversation.name != null`, [
        new botbuilder_dialogs_adaptive_1.SendActivity(`Hi {conversation.name}!`)
    ]).else([
        clDialog,
        new botbuilder_dialogs_adaptive_1.CodeStep(async (context) => {
            const entityMap = context.state.getValue(clDialog.resultProperty);
            for (let [key, value] of entityMap) {
                context.state.conversation.set(key, value);
                await context.context.sendActivity(`entityName: ${key} - entityValue: ${value}`);
            }
            return { status: botbuilder_dialogs_1.DialogTurnStatus.complete };
        })
        //, new SendActivity(`CLDialog result: {turn.CLResult} - {dialog.result} - {@CLResult}`)
    ])
]));
//# sourceMappingURL=index.js.map