import { PayloadTypes } from '../Payloads/PayloadTypes';
import { PayloadSender } from '../PayloadTransport/PayloadSender';
export declare class CancelDisassembler {
    private readonly sender;
    private readonly id;
    private readonly payloadType;
    constructor(sender: PayloadSender, id: string, payloadType: PayloadTypes);
    disassemble(): void;
}
