/// <reference types="node" />
import { Message } from "../message/Message";
import { CommandClass } from "./CommandClass";
export declare enum BasicCommand {
    Set = 1,
    Get = 2,
    Report = 3
}
export declare class ThermostatSetpoint extends Message {
    nodeId: number;
    ccCommand?: BasicCommand;
    constructor(nodeId: number, ccCommand?: BasicCommand, targetValue?: number);
    private _currentValue;
    readonly currentValue: number;
    private _targetValue;
    readonly targetValue: number;
    private _duration;
    readonly duration: number;
    private _wasSent;
    readonly wasSent: boolean;
    private SIZE_MASK;
    private PRECISION_MASK;
    private PRECISION_SHIFT;
    private getScaleAndPrecision;
    private setScale;
    encodeValue(value: number): number[];
    deserialize(data: Buffer): number;
    serialize(): Buffer;
    toJSON(): Record<string, any>;
}
export declare class ThermostatSetpointCC extends CommandClass {
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
