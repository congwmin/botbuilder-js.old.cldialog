"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword,
});
// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open echobot.bot file in the Emulator.`);
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
// Initialize bots root dialog
const dialogs = new botbuilder_dialogs_adaptive_1.AdaptiveDialog();
bot.rootDialog = dialogs;
//=================================================================================================
// Rules
//=================================================================================================
dialogs.recognizer = new botbuilder_dialogs_adaptive_1.RegExpRecognizer().addIntent('JokeIntent', /tell .*joke/i);
// Tell the user a joke
dialogs.addRule(new botbuilder_dialogs_adaptive_1.IntentRule('#JokeIntent', [
    new botbuilder_dialogs_adaptive_1.BeginDialog('TellJokeDialog')
]));
// Handle unknown intents
dialogs.addRule(new botbuilder_dialogs_adaptive_1.UnknownIntentRule([
    new botbuilder_dialogs_adaptive_1.BeginDialog('AskNameDialog')
]));
//=================================================================================================
// Child Dialogs
//=================================================================================================
const askNameDialog = new botbuilder_dialogs_adaptive_1.AdaptiveDialog('AskNameDialog', [
    new botbuilder_dialogs_adaptive_1.IfCondition('user.name == null', [
        new botbuilder_dialogs_adaptive_1.TextInput('user.name', `Hi! what's your name?`)
    ]),
    new botbuilder_dialogs_adaptive_1.SendActivity(`Hi {user.name}. It's nice to meet you.`),
    new botbuilder_dialogs_adaptive_1.EndDialog()
]);
dialogs.addDialog(askNameDialog);
const tellJokeDialog = new botbuilder_dialogs_adaptive_1.AdaptiveDialog('TellJokeDialog', [
    new botbuilder_dialogs_adaptive_1.SendActivity(`Why did the 🐔 cross the 🛣️?`),
    new botbuilder_dialogs_adaptive_1.EndTurn(),
    new botbuilder_dialogs_adaptive_1.SendActivity(`To get to the other side...`),
    new botbuilder_dialogs_adaptive_1.EndDialog()
]);
dialogs.addDialog(tellJokeDialog);
//# sourceMappingURL=index.js.map