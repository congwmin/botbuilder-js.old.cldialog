"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_1 = require("botbuilder");
const botbuilder_core_1 = require("botbuilder-core");
const botframework_connector_1 = require("botframework-connector");
const botframework_schema_1 = require("botframework-schema");
const os = require("os");
const botframework_streaming_extensions_1 = require("botframework-streaming-extensions"); //TODO: When integration layer is moved this will need to reference the external library.
const watershed_1 = require("watershed");
var StatusCodes;
(function (StatusCodes) {
    StatusCodes[StatusCodes["OK"] = 200] = "OK";
    StatusCodes[StatusCodes["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    StatusCodes[StatusCodes["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    StatusCodes[StatusCodes["NOT_FOUND"] = 404] = "NOT_FOUND";
    StatusCodes[StatusCodes["METHOD_NOT_ALLOWED"] = 405] = "METHOD_NOT_ALLOWED";
    StatusCodes[StatusCodes["UPGRADE_REQUIRED"] = 426] = "UPGRADE_REQUIRED";
    StatusCodes[StatusCodes["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    StatusCodes[StatusCodes["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
})(StatusCodes = exports.StatusCodes || (exports.StatusCodes = {}));
const defaultPipeName = 'bfv4.pipes';
const pjson = require('../package.json');
const VERSION_PATH = '/api/version';
const MESSAGES_PATH = '/api/messages';
const INVOKE_RESPONSE = 'BotFrameworkStreamingAdapter.InvokeResponse';
const GET = 'GET';
const POST = 'POST';
let USER_AGENT;
/// <summary>
/// Used to process incoming requests sent over an <see cref="IStreamingTransport"/> and adhering to the Bot Framework Protocol v3 with Streaming Extensions.
/// </summary>
class BotFrameworkStreamingAdapter extends botbuilder_1.BotFrameworkAdapter {
    /// <summary>
    /// Initializes a new instance of the <see cref="StreamingRequestHandler"/> class.
    /// The StreamingRequestHandler serves as a translation layer between the transport layer and bot adapter.
    /// It receives ReceiveRequests from the transport and provides them to the bot adapter in a form
    /// it is able to build activities out of, which are then handed to the bot itself to processed.
    /// Throws error if arguments are null.
    /// </summary>
    /// <param name="bot">The bot to be used for all requests to this handler.</param>
    /// <param name="logger">Optional logger, defaults to console.</param>
    /// <param name="settings">The settings for use with the BotFrameworkAdapter.</param>
    /// <param name="middlewareSet">An optional set of middleware to register with the adapter.</param>
    constructor(bot, logger = console, settings, middleWare = []) {
        super(settings);
        this.bot = bot;
        this.logger = logger;
        this.middleWare = middleWare;
    }
    /// <summary>
    /// Process the initial request to establish a long lived connection via a streaming server.
    /// </summary>
    /// <param name="req">The connection request.</param>
    /// <param name="res">The response sent on error or connection termination.</param>
    /// <param name="settings">Settings to set on the BotframeworkAdapter.</param>
    async connectWebSocket(req, res, settings) {
        if (!req.isUpgradeRequest()) {
            let e = new Error('Upgrade to WebSockets required.');
            this.logger.log(e);
            res.status(StatusCodes.UPGRADE_REQUIRED);
            res.send(e.message);
            return Promise.resolve();
        }
        const authenticated = await this.authenticateConnection(req, settings.appId, settings.appPassword, settings.channelService);
        if (!authenticated) {
            this.logger.log('Unauthorized connection attempt.');
            res.status(StatusCodes.UNAUTHORIZED);
            return Promise.resolve();
        }
        const upgrade = res.claimUpgrade();
        const ws = new watershed_1.Watershed();
        const socket = ws.accept(req, upgrade.socket, upgrade.head);
        await this.startWebSocket(new botframework_streaming_extensions_1.NodeWebSocket(socket));
    }
    /// <summary>
    /// Connects the handler to a Named Pipe server and begins listening for incoming requests.
    /// </summary>
    /// <param name="pipeName">The name of the named pipe to use when creating the server.</param>
    async connectNamedPipe(pipename = defaultPipeName) {
        this.server = new botframework_streaming_extensions_1.NamedPipeServer(pipename, this);
        await this.server.start();
    }
    /// <summary>
    /// Checks the validity of the request and attempts to map it the correct virtual endpoint,
    /// then generates and returns a response if appropriate.
    /// </summary>
    /// <param name="request">A ReceiveRequest from the connected channel.</param>
    /// <returns>A response created by the BotAdapter to be sent to the client that originated the request.</returns>
    async processRequest(request) {
        let response = new botframework_streaming_extensions_1.StreamingResponse();
        if (!request || !request.verb || !request.path) {
            response.statusCode = StatusCodes.BAD_REQUEST;
            this.logger.log('Request missing verb and/or path.');
            return response;
        }
        if (request.verb.toLocaleUpperCase() === GET && request.path.toLocaleLowerCase() === VERSION_PATH) {
            response.statusCode = StatusCodes.OK;
            response.setBody(this.getUserAgent());
            return response;
        }
        let body;
        try {
            body = await this.readRequestBodyAsString(request);
        }
        catch (error) {
            response.statusCode = StatusCodes.BAD_REQUEST;
            this.logger.log('Unable to read request body. Error: ' + error);
            return response;
        }
        if (request.verb.toLocaleUpperCase() !== POST) {
            response.statusCode = StatusCodes.METHOD_NOT_ALLOWED;
            return response;
        }
        if (request.path.toLocaleLowerCase() !== MESSAGES_PATH) {
            response.statusCode = StatusCodes.NOT_FOUND;
            return response;
        }
        try {
            this.middleWare.forEach((mw) => {
                this.use(mw);
            });
            let context = new botbuilder_core_1.TurnContext(this, body);
            await this.runMiddleware(context, async (turnContext) => {
                await this.bot.run(turnContext);
            });
            if (body.type === botframework_schema_1.ActivityTypes.Invoke) {
                let invokeResponse = context.turnState.get(INVOKE_RESPONSE);
                if (invokeResponse && invokeResponse.value) {
                    const value = invokeResponse.value;
                    response.statusCode = value.status;
                    response.setBody(value.body);
                }
                else {
                    response.statusCode = StatusCodes.NOT_IMPLEMENTED;
                }
            }
            else {
                response.statusCode = StatusCodes.OK;
            }
        }
        catch (error) {
            response.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
            this.logger.log(error);
            return response;
        }
        return response;
    }
    /// <summary>
    /// Hides the adapter's built in means of creating a connector client
    /// and subtitutes a StreamingHttpClient in place of the standard HttpClient,
    /// thus allowing compatibility with streaming extensions.
    /// </summary>
    createConnectorClient(serviceUrl) {
        return new botframework_connector_1.ConnectorClient(this.credentials, {
            baseUri: serviceUrl,
            userAgent: super['USER_AGENT'],
            httpClient: new StreamingHttpClient(this.server)
        });
    }
    async authenticateConnection(req, appId, appPassword, channelService) {
        if (!appId || !appPassword) {
            // auth is disabled
            return true;
        }
        try {
            let authHeader = req.headers.authorization || req.headers.Authorization || '';
            let channelIdHeader = req.headers.channelid || req.headers.ChannelId || req.headers.ChannelID || '';
            let credentials = new botframework_connector_1.MicrosoftAppCredentials(appId, appPassword);
            let credentialProvider = new botframework_connector_1.SimpleCredentialProvider(credentials.appId, credentials.appPassword);
            let claims = await botframework_connector_1.JwtTokenValidation.validateAuthHeader(authHeader, credentialProvider, channelService, channelIdHeader);
            return claims.isAuthenticated;
        }
        catch (error) {
            this.logger.log(error);
            return false;
        }
    }
    /// <summary>
    /// Connects the handler to a WebSocket server and begins listening for incoming requests.
    /// </summary>
    /// <param name="socket">The socket to use when creating the server.</param>
    async startWebSocket(socket) {
        this.server = new botframework_streaming_extensions_1.WebSocketServer(socket, this);
        await this.server.start();
    }
    async readRequestBodyAsString(request) {
        try {
            let contentStream = request.streams[0];
            return await contentStream.readAsJson();
        }
        catch (error) {
            this.logger.log(error);
            return Promise.reject(error);
        }
    }
    getUserAgent() {
        if (USER_AGENT) {
            return USER_AGENT;
        }
        const ARCHITECTURE = os.arch();
        const TYPE = os.type();
        const RELEASE = os.release();
        const NODE_VERSION = process.version;
        USER_AGENT = `Microsoft-BotFramework/3.1 BotBuilder/${pjson.version} ` +
            `(Node.js,Version=${NODE_VERSION}; ${TYPE} ${RELEASE}; ${ARCHITECTURE})`;
        return USER_AGENT;
    }
}
exports.BotFrameworkStreamingAdapter = BotFrameworkStreamingAdapter;
class StreamingHttpClient {
    constructor(server) {
        this.server = server;
    }
    /// <summary>
    /// This function hides the default sendRequest of the HttpClient, replacing it
    /// with a version that takes the WebResource created by the BotFrameworkAdapter
    /// and converting it to a form that can be sent over a streaming transport.
    /// </summary>
    /// <param name="httpRequest">The outgoing request created by the BotframeworkAdapter.</param>
    /// <returns>The streaming transport compatible response to send back to the client.</returns>
    async sendRequest(httpRequest) {
        const request = this.mapHttpRequestToProtocolRequest(httpRequest);
        request.path = request.path.substring(request.path.indexOf('/v3'));
        const res = await this.server.send(request);
        return {
            request: httpRequest,
            status: res.statusCode,
            headers: httpRequest.headers,
            readableStreamBody: res.streams.length > 0 ? res.streams[0].getStream() : undefined
        };
    }
    mapHttpRequestToProtocolRequest(httpRequest) {
        return botframework_streaming_extensions_1.StreamingRequest.create(httpRequest.method, httpRequest.url, httpRequest.body);
    }
}
//# sourceMappingURL=BotFrameworkStreamingAdapter.js.map