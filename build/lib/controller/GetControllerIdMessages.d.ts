/// <reference types="node" />
import { Message } from "../message/Message";
export declare class GetControllerIdRequest extends Message {
}
export declare class GetControllerIdResponse extends Message {
    private _homeId;
    readonly homeId: number;
    private _ownNodeId;
    readonly ownNodeId: number;
    deserialize(data: Buffer): number;
    toJSON(): Record<string, any>;
}
