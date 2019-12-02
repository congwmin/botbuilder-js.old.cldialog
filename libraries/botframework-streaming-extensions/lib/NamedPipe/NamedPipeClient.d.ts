import { RequestHandler } from '../RequestHandler';
import { StreamingRequest } from '../StreamingRequest';
import { IStreamingTransportClient, IReceiveResponse } from '../Interfaces';
export declare class NamedPipeClient implements IStreamingTransportClient {
    private readonly _baseName;
    private readonly _requestHandler;
    private readonly _sender;
    private readonly _receiver;
    private readonly _requestManager;
    private readonly _protocolAdapter;
    private readonly _autoReconnect;
    private _isDisconnecting;
    constructor(baseName: string, requestHandler?: RequestHandler, autoReconnect?: boolean);
    connect(): Promise<void>;
    disconnect(): void;
    send(request: StreamingRequest): Promise<IReceiveResponse>;
    private onConnectionDisconnected;
}
