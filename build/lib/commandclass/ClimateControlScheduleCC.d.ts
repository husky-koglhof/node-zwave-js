/// <reference types="node" />
import { CommandClass } from "./CommandClass";
export declare enum BasicCommand {
    Set = 1,
    Get = 2,
    Report = 3,
    ExtendedReport = 8
}
export declare class ClimateControlScheduleCC extends CommandClass {
    nodeId: number;
    ccCommand?: BasicCommand;
    constructor(nodeId?: number);
    constructor(nodeId: number, ccCommand: BasicCommand.Get);
    constructor(nodeId: number, ccCommand: BasicCommand.Set, targetValue: number);
    private _currentValue;
    readonly currentValue: number;
    private _targetValue;
    readonly targetValue: number;
    private _duration;
    readonly duration: number;
    serialize(): Buffer;
    deserialize(data: Buffer): void;
}
