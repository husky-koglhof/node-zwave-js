/// <reference types="node" />
import { CommandClass } from "./CommandClass";
export declare enum BinarySwitchCommand {
    Set = 1,
    Get = 2,
    Report = 3
}
export declare class BinarySwitchCC extends CommandClass {
    nodeId: number;
    ccCommand?: BinarySwitchCommand;
    targetValue?: BinarySwitchState;
    duration?: number;
    constructor(nodeId?: number);
    constructor(nodeId: number, ccCommand: BinarySwitchCommand.Get);
    constructor(nodeId: number, ccCommand: BinarySwitchCommand.Set, targetValue: boolean, duration?: number);
    private _currentValue;
    readonly currentValue: boolean | "unknown";
    serialize(): Buffer;
    deserialize(data: Buffer): void;
}
export declare type BinarySwitchState = boolean | "unknown";
