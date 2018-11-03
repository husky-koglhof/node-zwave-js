/// <reference types="node" />
import { CommandClass } from "./CommandClass";
export declare enum MultilevelSwitchCommand {
    Set = 1,
    Get = 2,
    Report = 3,
    StartLevelChange = 4,
    StopLevelChange = 5,
    SupportedGet = 6,
    SupportedReport = 7
}
export declare class MultilevelSwitchCC extends CommandClass {
    nodeId: number;
    ccCommand?: MultilevelSwitchCommand;
    constructor(nodeId?: number);
    constructor(nodeId: number, ccCommand: MultilevelSwitchCommand.Get);
    constructor(nodeId: number, ccCommand: MultilevelSwitchCommand.Set, targetValue: number, duration?: number);
    constructor(nodeId: number, ccCommand: MultilevelSwitchCommand.StartLevelChange, direction: keyof typeof LevelChangeDirection, ignoreStartLevel: boolean, startLevel: number, duration?: number, secondarySwitchDirection?: keyof typeof LevelChangeDirection);
    constructor(nodeId: number, ccCommand: MultilevelSwitchCommand.StopLevelChange);
    constructor(nodeId: number, ccCommand: MultilevelSwitchCommand.SupportedGet);
    targetValue: number;
    duration: number;
    direction: keyof typeof LevelChangeDirection;
    secondarySwitchDirection: keyof typeof LevelChangeDirection;
    ignoreStartLevel: boolean;
    startLevel: number;
    secondarySwitchStepSize: number;
    private _primarySwitchType;
    readonly primarySwitchType: SwitchType;
    private _secondarySwitchType;
    readonly secondarySwitchType: SwitchType;
    private _currentValue;
    readonly currentValue: number;
    serialize(): Buffer;
    deserialize(data: Buffer): void;
}
export declare enum LevelChangeDirection {
    "up" = 0,
    "down" = 1,
    "none" = 3
}
export declare enum SwitchType {
    "not supported" = 0,
    "Off/On" = 1,
    "Down/Up" = 2,
    "Close/Open" = 3,
    "CCW/CW" = 4,
    "Left/Right" = 5,
    "Reverse/Forward" = 6,
    "Pull/Push" = 7
}
