/**
 * @module botbuilder-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotFrameworkAdapterSettings, BotFrameworkAdapter } from 'botbuilder';
import { ActivityHandler, Middleware, MiddlewareHandler } from 'botbuilder-core';
import { ConnectorClient } from 'botframework-connector';
import { IReceiveRequest, RequestHandler, StreamingResponse } from 'botframework-streaming-extensions';
import { Request, ServerUpgradeResponse } from 'restify';
export declare enum StatusCodes {
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    UPGRADE_REQUIRED = 426,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501
}
export declare class BotFrameworkStreamingAdapter extends BotFrameworkAdapter implements RequestHandler {
    private bot;
    private logger;
    private server;
    private middleWare;
    constructor(bot: ActivityHandler, logger?: Console, settings?: BotFrameworkAdapterSettings, middleWare?: (MiddlewareHandler | Middleware)[]);
    connectWebSocket(req: Request, res: ServerUpgradeResponse, settings: BotFrameworkAdapterSettings): Promise<void>;
    connectNamedPipe(pipename?: string): Promise<void>;
    processRequest(request: IReceiveRequest): Promise<StreamingResponse>;
    createConnectorClient(serviceUrl: string): ConnectorClient;
    private authenticateConnection;
    private startWebSocket;
    private readRequestBodyAsString;
    private getUserAgent;
}
