/// <reference types="node" />
import { CommandClass } from "./CommandClass";
export declare enum BasicCommand {
    Set = 1,
    Get = 2,
    Report = 3,
    Undefined = 4,
    ExtendedReport = 5
}
export declare class MultiLevelSensorCC extends CommandClass {
    nodeId: number;
    ccCommand?: BasicCommand;
    constructor(nodeId?: number);
    constructor(nodeId: number, ccCommand: BasicCommand.Get);
    constructor(nodeId: number, ccCommand: BasicCommand.Set, targetValue: number);
    private _currentValue;
    private _sensor;
    readonly currentValue: number;
    private _targetValue;
    readonly targetValue: number;
    private _duration;
    readonly duration: number;
    private sensorTypes;
    private getSensor;
    serialize(): Buffer;
    deserialize(data: Buffer): void;
}
