import { PayloadTypes } from '../Payloads/PayloadTypes';
import { PayloadSender } from '../PayloadTransport/PayloadSender';
import { IStreamWrapper } from '../Interfaces/IStreamWrapper';
export declare abstract class PayloadDisassembler {
    abstract payloadType: PayloadTypes;
    private readonly sender;
    private stream;
    private streamLength?;
    private readonly id;
    constructor(sender: PayloadSender, id: string);
    protected static serialize<T>(item: T): IStreamWrapper;
    abstract getStream(): Promise<IStreamWrapper>;
    disassemble(): Promise<void>;
    private send;
}
