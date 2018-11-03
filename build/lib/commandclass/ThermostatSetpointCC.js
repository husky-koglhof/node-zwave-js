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
})(BasicCommand = exports.BasicCommand || (exports.BasicCommand = {}));
let ThermostatSetpointCC = class ThermostatSetpointCC extends CommandClass_1.CommandClass {
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
                this._currentValue = this.payload[1];
                // starting in V2:
                // this._targetValue = this.payload[2];
                const value = super.extractValue(2);
                logger_1.log("controller", `Thermostat Setpoint Report: ${value}`, "debug");
                this._duration = this.payload[3];
                break;
            default:
                throw new ZWaveError_1.ZWaveError(`Cannot deserialize a Basic CC with a command other than Report. Received ${BasicCommand[this.ccCommand]} (${strings_1.num2hex(this.ccCommand)})`, ZWaveError_1.ZWaveErrorCodes.CC_Invalid);
        }
    }
};
ThermostatSetpointCC = __decorate([
    CommandClass_1.commandClass(CommandClass_1.CommandClasses["Thermostat Setpoint"]),
    CommandClass_1.implementedVersion(2) // Update tests in CommandClass.test.ts when changing this
    ,
    CommandClass_1.expectedCCResponse(CommandClass_1.CommandClasses["Thermostat Setpoint"]),
    __metadata("design:paramtypes", [Number, Number, Number])
], ThermostatSetpointCC);
exports.ThermostatSetpointCC = ThermostatSetpointCC;
