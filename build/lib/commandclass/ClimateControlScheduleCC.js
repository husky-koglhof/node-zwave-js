"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const ZWaveError_1 = require("../error/ZWaveError");
const logger_1 = require("../util/logger");
const strings_1 = require("../util/strings");
const CommandClass_1 = require("./CommandClass");
// TODO: encode duration:
// SET:
// 0x00 = instantly
// 0x01..0x7F = 1 to 127 seconds
// 0x80..0xFE = 1 to 127 minutes
// 0xFF = factory default
// ---
// REPORT:
// 0x00 = already at the target value
// 0x01..0x7F = 1 to 127 seconds
// 0x80..0xFD = 1 to 126 minutes
// 0xFE = unknown duration
// 0xFF = reserved
var BasicCommand;
(function (BasicCommand) {
    BasicCommand[BasicCommand["Set"] = 1] = "Set";
    BasicCommand[BasicCommand["Get"] = 2] = "Get";
    BasicCommand[BasicCommand["Report"] = 3] = "Report";
    BasicCommand[BasicCommand["ExtendedReport"] = 8] = "ExtendedReport";
})(BasicCommand = exports.BasicCommand || (exports.BasicCommand = {}));
let ClimateControlScheduleCC = class ClimateControlScheduleCC extends CommandClass_1.CommandClass {
    constructor(nodeId, ccCommand, targetValue) {
        super(nodeId);
        this.nodeId = nodeId;
        this.ccCommand = ccCommand;
        this._targetValue = targetValue;
    }
    get currentValue() {
        return this._currentValue;
    }
    get targetValue() {
        return this._targetValue;
    }
    get duration() {
        return this._duration;
    }
    serialize() {
        switch (this.ccCommand) {
            case BasicCommand.Get:
                this.payload = Buffer.from([this.ccCommand]);
                // no real payload
                break;
            case BasicCommand.Set:
                this.payload = Buffer.from([
                    this.ccCommand,
                    this._targetValue,
                ]);
                break;
            default:
                throw new ZWaveError_1.ZWaveError("Cannot serialize a Basic CC with a command other than Get or Set", ZWaveError_1.ZWaveErrorCodes.CC_Invalid);
        }
        return super.serialize();
    }
    deserialize(data) {
        super.deserialize(data);
        this.ccCommand = this.payload[0];
        switch (this.ccCommand) {
            case BasicCommand.Report:
            case BasicCommand.ExtendedReport:
                let day = this.payload[1] & 0x07;
                if (day > 7) {
                    logger_1.log("self", `Day Value was greater than range. Setting to Invalid`, "debug");
                    day = 0;
                }
                for (let i = 2; i < 29; i += 3) {
                    const setback = this.payload[i + 2];
                    if (setback === 0x7f) {
                        // Switch point is unused, so we stop parsing here
                        break;
                    }
                    const hours = this.payload[i] & 0x1f;
                    const minutes = this.payload[i + 1] & 0x3f;
                    if (setback === 0x79) {
                        logger_1.log("self", `ClimateControlSchedule Frost Protection Mode: ${this.nodeId} = ${day} - ${hours}:${minutes}`, "debug");
                    }
                    else if (setback === 0x7a) {
                        logger_1.log("self", `ClimateControlSchedule Energy Saving Mode: ${this.nodeId} = ${day} - ${hours}:${minutes}`, "debug");
                    }
                    else {
                        logger_1.log("self", `ClimateControlSchedule Setback: ${this.nodeId} = ${day} - ${hours}:${minutes} - ${setback}`, "debug");
                    }
                    this._currentValue = 4711;
                    // value->SetSwitchPoint( hours, minutes, setback );
                }
                logger_1.log("self", `ClimateControlSchedule Report: ${this.nodeId} = ${this._currentValue}`, "info");
                logger_1.log("controller", `ClimateControlSchedule Report: ${this.nodeId} = ${this._currentValue}`, "info");
                break;
            default:
                throw new ZWaveError_1.ZWaveError(`Cannot deserialize a Basic CC with a command other than Report. Received ${BasicCommand[this.ccCommand]} (${strings_1.num2hex(this.ccCommand)})`, ZWaveError_1.ZWaveErrorCodes.CC_Invalid);
        }
    }
};
ClimateControlScheduleCC = __decorate([
    CommandClass_1.commandClass(CommandClass_1.CommandClasses["Climate Control Schedule"]),
    CommandClass_1.implementedVersion(2) // Update tests in CommandClass.test.ts when changing this
    ,
    CommandClass_1.expectedCCResponse(CommandClass_1.CommandClasses["Climate Control Schedule"]),
    __metadata("design:paramtypes", [Number, Number, Number])
], ClimateControlScheduleCC);
exports.ClimateControlScheduleCC = ClimateControlScheduleCC;
