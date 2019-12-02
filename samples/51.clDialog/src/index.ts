// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { BotFrameworkAdapter, MemoryStorage } from 'botbuilder';
import { AdaptiveDialog, UnknownIntentRule, SendActivity, IfCondition, CLDialog } from 'botbuilder-dialogs-adaptive';
import { DialogManager } from 'botbuilder-dialogs';

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open echobot.bot file in the Emulator.`);
});

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
const adapter = new BotFrameworkAdapter({
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword,
});

// Create bots DialogManager and bind to state storage
const bot = new DialogManager();
bot.storage = new MemoryStorage();

// Initialize bots root dialog
const dialogs = new AdaptiveDialog();
bot.rootDialog = dialogs;

// Listen for incoming activities.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route activity to bot.
        await bot.onTurn(context);
    });
});

// init conversation learner dialog
const LUIS_AUTHORING_KEY = 'db27ae1536f044a4b07df08b607dcd17'
const MODEL_ID = '880b7acf-00fd-4f38-a1d6-4ed405610959'
const clDialog = new CLDialog(LUIS_AUTHORING_KEY, MODEL_ID, bot.storage)

// Handle unknown intents
dialogs.addRule(new UnknownIntentRule([
    new IfCondition(`conversation.name != null`, [
        new SendActivity(`Hi {conversation.name}!`)
    ]).else([
        clDialog,
    ])
]));

