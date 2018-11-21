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
const Constants_1 = require("../message/Constants");
const Message_1 = require("../message/Message");
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
let ThermostatSetpoint = class ThermostatSetpoint extends Message_1.Message {
    constructor(nodeId, ccCommand, targetValue) {
        super();
        this.nodeId = nodeId;
        this.ccCommand = ccCommand;
        this.SIZE_MASK = 0x07;
        this.PRECISION_MASK = 0xe0;
        this._targetValue = targetValue;
        // this.type = 0x00; // REQUEST
        // this.functionType = 0x19; // FUNC_ID_ZW_SEND_DATA
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
    get wasSent() {
        return this._wasSent;
    }

    // FUNCTIONS TODO

    // private _errorCode: number;
    // public get errorCode(): number {
    // 	return this._errorCode;
    // }
    deserialize(data) {
        const ret = super.deserialize(data);
        this._wasSent = this.payload[0] !== 0;
        // if (!this._wasSent) this._errorCode = this.payload[0];
        return ret;
    }
    serialize() {
        const scale = 0; // Fahrenheit = 1, Celsius = 0
        const setpointType = 1; // HardCoded
        const setpoint = this._targetValue;
        try {
            let array = super.appendValue(setpoint, scale);
            const size = super.valueToInteger(setpoint).o_size;

            array.unshift(1); // ???
            array.unshift(1); // ???
            array.unshift(CommandClass_1.CommandClasses['Thermostat Setpoint']);
            array.unshift(size + 4);
            array.unshift(this.nodeId);
            
            array.push(37); // (TRANSMIT_OPTION_ACK | TRANSMIT_OPTION_AUTO_ROUTE | TRANSMIT_OPTION_EXPLORE) // Hardcoded

            this.payload = Buffer.from(array);
            logger_1.log("self", `BUFFER: 0x${this.payload.toString("hex")}`, "debug")
        }
        catch (e) {
            logger_1.log("self", `an exception has occured`, "debug");
            throw new ZWaveError_1.ZWaveError("NODE {}: Got an arithmetic exception converting value {} to a valid Z-Wave value. Ignoring THERMOSTAT_SETPOINT_SET message.", ZWaveError_1.ZWaveErrorCodes.ArithmeticException);
        }
        return super.serialize();
    }
    toJSON() {
        return super.toJSONInherited({
            wasSent: this.wasSent,
        });
    }
};
ThermostatSetpoint = __decorate([
    Message_1.messageTypes(Constants_1.MessageType.Request, Constants_1.FunctionType.SendData),
    __metadata("design:paramtypes", [Number, Number, Number])
], ThermostatSetpoint);
exports.ThermostatSetpoint = ThermostatSetpoint;
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
    // setpointTypes
    // HEATING(1, "Heating"),
    // COOLING(2, "Cooling"),
    // FURNACE(7, "Furnace"),
    // DRY_AIR(8, "Dry Air"),
    // MOIST_AIR(9, "Moist Air"),
    // AUTO_CHANGEOVER(10, "Auto Changeover"),
    // HEATING_ECON(11, "Heating Economical"),
    // COOLING_ECON(12, "Cooling Economical"),
    // AWAY_HEATING(13, "Away Heating");
    serialize() {
        switch (this.ccCommand) {
            case BasicCommand.Get:
                this.payload = Buffer.from([this.ccCommand]);
                // no real payload
                break;
            case BasicCommand.Set:
                // this.payload = Buffer.from([
                // 	this.ccCommand,
                // 	this._targetValue,
                // ]);
                const scale = 0;
                const setpointType = 1;
                const setpoint = this._targetValue;
                try {
                    const encodedValue = super.encodeValue(setpoint);
                    const array = [
                        setpointType,
                        encodedValue[0] + (scale << 3),
                    ];
                    for (const element of encodedValue) {
                        array.push(encodedValue[element]);
                    }
                    this.payload = Buffer.from(array);
                }
                catch (e) {
                    logger_1.log("self", `an exception has occured`, "debug");
                    throw new ZWaveError_1.ZWaveError("NODE {}: Got an arithmetic exception converting value {} to a valid Z-Wave value. Ignoring THERMOSTAT_SETPOINT_SET message.", ZWaveError_1.ZWaveErrorCodes.ArithmeticException);
                }
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
                // this._currentValue = this.payload[1];
                // starting in V2:
                // this._targetValue = this.payload[2];
                this._currentValue = super.extractValue(2);
                logger_1.log("controller", `Thermostat Setpoint Report: ${this.nodeId} = ${this._currentValue}`, "info");
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
