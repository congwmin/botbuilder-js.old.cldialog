import { RequestHandler } from '../RequestHandler';
import { StreamingRequest } from '../StreamingRequest';
import { ISocket } from '../Interfaces/ISocket';
import { IStreamingTransportServer, IReceiveResponse } from '../Interfaces';
export declare class WebSocketServer implements IStreamingTransportServer {
    private readonly _url;
    private readonly _requestHandler;
    private readonly _sender;
    private readonly _receiver;
    private readonly _requestManager;
    private readonly _protocolAdapter;
    private readonly _webSocketTransport;
    private _closedSignal;
    constructor(socket: ISocket, requestHandler?: RequestHandler);
    start(): Promise<string>;
    send(request: StreamingRequest): Promise<IReceiveResponse>;
    disconnect(): void;
    private onConnectionDisconnected;
}
