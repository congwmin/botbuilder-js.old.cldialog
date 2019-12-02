import { RequestHandler } from '../RequestHandler';
import { StreamingRequest } from '../StreamingRequest';
import { IStreamingTransportServer, IReceiveResponse } from '../Interfaces';
export declare class NamedPipeServer implements IStreamingTransportServer {
    private _outgoingServer;
    private _incomingServer;
    private readonly _baseName;
    private readonly _requestHandler;
    private readonly _sender;
    private readonly _receiver;
    private readonly _requestManager;
    private readonly _protocolAdapter;
    private readonly _autoReconnect;
    private _isDisconnecting;
    constructor(baseName: string, requestHandler?: RequestHandler, autoReconnect?: boolean);
    start(): Promise<string>;
    disconnect(): void;
    send(request: StreamingRequest): Promise<IReceiveResponse>;
    private onConnectionDisconnected;
}
