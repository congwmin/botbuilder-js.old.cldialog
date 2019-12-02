const { Configurable, TextPrompt, Dialog, DialogManager } = require('botbuilder-dialogs');
const { AdaptiveDialog } = require('botbuilder-dialogs-adaptive');
const { MemoryStorage, TestAdapter } = require('botbuilder-core');
const { TypeFactory, TypeLoader, IResourceProvider, FileResource, FileResourceProvider } = require('../lib');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('TypeLoader', function () {
    this.timeout(5000);

    it('TypeLoader TextPrompt: simple textprompt dialog should prompt for text', async function () {
        declarativeTestCase('00 - TextPrompt/SimplePrompt.main.dialog', null, async function(adapter){
            await adapter.send('hi')
                .assertReply('Hello, I\'m Zoidberg. What is your name?');
        });
    });

    it('TypeLoader Steps: should be ran when no other rules', async function () {
        declarativeTestCase('01 - Steps/Steps.main.dialog', null, async function(adapter){
            await adapter.send('hi')
                .assertReply('Step 1')
                .assertReply('Step 2')
                .assertReply('Step 3');
        });
    });

    it('TypeLoader EndTurn: end turn should wait for user input', async function () {
        declarativeTestCase('02 - EndTurn/EndTurn.main.dialog', null, async function(adapter){
            await adapter
            .send('hi')
                .assertReply('What\'s up?')
            .send('not much homie')
                .assertReply('Oh I see!');
        });
    });

    it('TypeLoader TextInput: should prompt for name and then use name in response. Next time prompt should not ask for property that is already in memory', async function () {
        declarativeTestCase('04 - TextInput\\TextInput.main.dialog', null, async function(adapter){
            await adapter
            .send('hi')
                .assertReply('Hello, I\'m Zoidberg. What is your name?')
            .send('Carlos')
                .assertReply('Hello Carlos, nice to talk to you!')
        });
    });

    it('TypeLoader IntentRule: intent rule should route according to intent defined in recognizer', async function () {
        declarativeTestCase('07 - BeginDialog/BeginDialog.main.dialog', '07 - BeginDialog', async function(adapter){
            await adapter
            .send('hi')
                .assertReply('Hello, I\'m Zoidberg. What is your name?')
            .send('Bender')
                .assertReply('Hello Bender, nice to talk to you!')
            .send('tell me a joke') 
                .assertReply('Why did the chicken cross the road?') 
            .send('why?')
                .assertReply('To get to the other side')
            .send('tell my fortune')
                .assertReply('Seeing into the future...')
                .assertReply('I see great things in your future...')
                .assertReply('Potentially a successful demo')
        });
    });

    // it('TypeLoader CLDialog: use conversation learner sdk', async function () {
    //     declarativeTestCase('15 - CLDialog/CLDialog.main.dialog', null, async function(adapter){
    //         await adapter
    //         .send('weather in Beijing')
    //             .assertReply('When?')
    //         .send('today')
    //             .assertReply("today's weather in Beijing is sunny.")
    //     });
    // });

    it('TypeLoader CLDialogMore: use conversation learner sdk', async function () {
        declarativeTestCase('16 - CLDialogMore/CLDialogMore.main.dialog', "16 - CLDialogMore", async function(adapter){
            await adapter
            .send('hi')
                .assertReply('Hello, I\'m Zoidberg. What is your name?')
            .send("Wendy")
                .assertReply("Hello Wendy, nice to talk to you!")
            .send('tell my fortune')
                .assertReply('Seeing into the future...')
                .assertReply('I see great things in your future...')
                .assertReply('Potentially a successful demo')
            .send('weather in Beijing')
                .assertReply('When?')
            .send('today')
                .assertReply("today's weather in Beijing is sunny.")
        });
    });
});

function declarativeTestCase(path, resourcesFolder, callback) {

    readPackageJson(`libraries/botbuilder-dialogs-declarative/tests/resources/${path}`,
        async function (err, json) {
            if (err) {
                assert.fail(err);
                return;
            }
            let loader = new TypeLoader();

            if (resourcesFolder) {
                let resourceProvider = new FileResourceProvider();
                resourceProvider.registerDirectory(`libraries/botbuilder-dialogs-declarative/tests/resources`);
                loader = new TypeLoader(null, resourceProvider)
            }
            
            const dialog = await loader.load(json);

            // Create bots DialogManager and bind to state storage
            const bot = new DialogManager();
            bot.storage = new MemoryStorage();

            const adapter = new TestAdapter(async turnContext => {
                // Route activity to bot.
                await bot.onTurn(turnContext);
            });

            bot.rootDialog = dialog;

            await callback(adapter);
    });
}

function readPackageJson(path, done) {
    fs.readFile(path, function (err, buffer) {
      if (err) { return done(err); }
      var json = JSON.parse(buffer.toString().trim());
      return done(null, json);
    });
}
