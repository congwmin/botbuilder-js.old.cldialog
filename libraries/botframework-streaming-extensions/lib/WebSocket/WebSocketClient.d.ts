import { StreamingRequest } from '../StreamingRequest';
import { IStreamingTransportClient, IReceiveResponse } from '../Interfaces';
export declare class WebSocketClient implements IStreamingTransportClient {
    private readonly _url;
    private readonly _requestHandler;
    private readonly _sender;
    private readonly _receiver;
    private readonly _requestManager;
    private readonly _protocolAdapter;
    private readonly _autoReconnect;
    constructor({ url, requestHandler, autoReconnect }: {
        url: any;
        requestHandler: any;
        autoReconnect?: boolean;
    });
    connect(): Promise<void>;
    disconnect(): void;
    send(request: StreamingRequest): Promise<IReceiveResponse>;
    private onConnectionDisconnected;
}
