import { ISocket } from '../Interfaces/ISocket';
export declare class NodeWebSocket implements ISocket {
    private readonly waterShedSocket;
    private connected;
    constructor(waterShedSocket?: any);
    isConnected(): boolean;
    write(buffer: Buffer): void;
    connect(serverAddress: any, port?: number): Promise<void>;
    setOnMessageHandler(handler: (x: any) => void): void;
    close(): any;
    setOnCloseHandler(handler: (x: any) => void): void;
    setOnErrorHandler(handler: (x: any) => void): void;
}
