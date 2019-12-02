// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';
import { BotFrameworkAdapter, MemoryStorage } from 'botbuilder';
import { DialogManager, Dialog } from 'botbuilder-dialogs';
import { TypeLoader} from 'botbuilder-dialogs-declarative';
import fs = require('fs');

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

const path = "../../libraries/botbuilder-dialogs-declarative/tests/resources/15 - CLDialog/CLDialog.main.dialog"

function readPackageJson(path, done) {
    fs.readFile(path, function (err, buffer) {
      if (err) { return done(err); }
      var json = JSON.parse(buffer.toString().trim());
      return done(null, json);
    });
}

async function LoadDialog(path){
    readPackageJson(path,
        async function (err, json) {
            if (err) {
                console.log(err);
                return;
            }

            // Create bots DialogManager and bind to state storage
            const bot = new DialogManager();
            bot.storage = new MemoryStorage();

            // bind rootDialog
            let loader = new TypeLoader();
            const dialog = await loader.load(json);
            bot.rootDialog = dialog as Dialog

            // Listen for incoming activities.
            server.post('/api/messages', (req, res) => {
                adapter.processActivity(req, res, async (context) => {
                    // Route activity to bot.
                    await bot.onTurn(context);
                });
            });
    });
}

LoadDialog(path)